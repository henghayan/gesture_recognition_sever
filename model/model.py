import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.contrib import rnn
from sample import SF
import os
from tensorflow.python.tools import inspect_checkpoint as chkp

gpu_options = tf.GPUOptions(per_process_gpu_memory_fraction=0.333)


class RnnModel:
    def __init__(self, n_a, n_x, n_c, n_t):
        self.session = tf.Session(config=tf.ConfigProto(gpu_options=gpu_options))  # 初始化sesion，防止Session多次初始化浪费时间
        self.units = n_a  # 单个LSTM cell 包含的神经元数量
        self.feature = n_x  # 单个输入的特征数量
        self.n_c = n_c  # 分类 ， 这里二分类数值为1即可，激活函数用sigmod
        self.step = n_t  # 时间步数，即 多少个LSTM cell
        self.w = tf.Variable(tf.random_normal([self.units, self.n_c]), name='w')  # 最后一层的LSTM cell w权重
        self.b = tf.Variable(tf.random_normal([self.n_c]), name='b')  # 最后一层的LSTM cell b 偏差
        # self.w1 = tf.Variable(tf.random_normal([self.step, self.units, self.n_c]), name='w1')
        # self.b1 = tf.Variable([self.step], name='b1')  # 全连接层LSTM cell b 偏差
        self.w2 = tf.Variable(tf.random_normal([self.step, self.n_c]), name='w2')
        self.b2 = tf.Variable(tf.random_normal([self.n_c]), name='b2')
        self.model = rnn.BasicLSTMCell(self.units)  # 采用模型为Basic LSTM Cell
        self.xplaceholder = tf.placeholder('float', [None, self.step, 3], name='x')  # 虚拟化输入占位
        self.yplaceholder = tf.placeholder('float', name='y')  # 虚拟化结果占位

    def model_design(self):
        x = tf.split(self.xplaceholder, self.step, 1)  # 对Tensor 进行 步长分割
        x = list(map(lambda xx: tf.reshape(xx, [-1, 3]), x))  # 对Tensor 进行 维度修剪

        outputs, states = rnn.static_rnn(self.model, x, dtype=tf.float32)  # 定义 输入模型，输入值
        output = tf.matmul(outputs[-1], self.w) + self.b  # 定义最后一层LSTM cell 结果为最终结果

        return output

    def model_full_connect(self):
        x = tf.split(self.xplaceholder, self.step, 1)  # 对Tensor 进行 步长分割
        x = list(map(lambda xx: tf.reshape(xx, [-1, 3]), x))  # 对Tensor 进行 维度修剪

        outputs, states = rnn.static_rnn(self.model, x, dtype=tf.float32)  # 定义 输入模型，输入值
        temp_outputs = []
        c = 0
        for output_index in range(len(outputs)):   #自定义lstm 接全连接层
            cell_w = tf.Variable(tf.random_normal([self.units, self.n_c]), name='cell_w%s' % c)
            cell_b = tf.Variable(tf.random_normal([self.n_c]), name='cell_b%s' % c)
            temp_output = tf.matmul(outputs[output_index], cell_w) + cell_b
            temp_outputs.append(temp_output)
            c += 1
        outputs = tf.reshape(temp_outputs, [-1, self.step], name='outputs')
        output = tf.matmul(outputs, self.w2) + self.b2
        return output

    def run(self, data, epochs, save_path='./save/model', batch_size=256, save_threshold=0.93):
        output = self.model_design()
        # output = self.model_full_connect()
        output = tf.reshape(output, [-1], name='output')  # -1 为 python自适应识别 维度
        cost = tf.reduce_mean(tf.nn.sigmoid_cross_entropy_with_logits(logits=output,
                                                                      labels=self.yplaceholder))  # 定义损失函数为经sigmoid 函数激活之后的交叉熵平均值

        optimizer = tf.train.AdamOptimizer(learning_rate=0.01, beta1=0.8, beta2=0.9, epsilon=1e-08).minimize(cost)  # 定义优化方向为最小化cost
        # optimizer = tf.train.GradientDescentOptimizer(0.01).minimize(cost)
        train_sample_x = data['train_x']  # 获取输入样本。这里后期要做random 以及 mini bentch
        train_sample_y = data['train_y']
        test_sample_x = data['test_x']
        test_sample_y = np.array(data['test_y'])

        plt_data = []
        print('train_sample_x.shape', train_sample_x.shape)
        print('train_sample_y.shape', train_sample_y.shape)
        saver = tf.train.Saver()
        with self.session as sess:  # 运行， 初始化隐藏参数
            tf.global_variables_initializer().run()
            tf.local_variables_initializer().run()
            plt.figure()
            test_accuracy_data = []
            for epoch in range(epochs):

                mimi_x = self.get_mini_batch(train_sample_x, size=batch_size, epoch=epoch)
                mimi_y = self.get_mini_batch(train_sample_y, size=batch_size, epoch=epoch)
                _, c = sess.run([optimizer, cost],
                                feed_dict={self.xplaceholder: mimi_x, self.yplaceholder: mimi_y})

                if epoch % 50 == 0:
                    print('epoch', epoch)
                    plt_data.append(c)
                    print('cost', c)
                    res = tf.round(tf.nn.sigmoid(output), name='predict')
                    test_predict = sess.run(res, feed_dict={self.xplaceholder: test_sample_x})
                    train_predict = sess.run(res, feed_dict={self.xplaceholder: train_sample_x})

                    # pred = np.array(tf.round(tf.nn.sigmoid(output)).eval({self.xplaceholder: test_sample_x}))

                    test_accuracy = ((test_predict == test_sample_y) + 0).sum() / (len(test_sample_y))
                    train_accuracy = ((train_predict == train_sample_y) + 0).sum() / (len(train_sample_y))
                    test_accuracy_data.append(test_accuracy)
                    # print('predict', predict)
                    print('测试集正确率: %.2f %% ' % (test_accuracy * 100))
                    print('训练集正确率: %.2f %% ' % (train_accuracy * 100))
                    print('--------------------------------')
                    if epoch >= 5000 and test_accuracy > save_threshold:
                        saver.save(sess, save_path + "%s_%s.ckpt" % (epoch, int(save_threshold * 100)))
                        print("Model Saved")
                        if save_threshold > 0.99:
                            break
                        save_threshold += 0.01

                    if epoch >= 20000:
                        saver.save(sess, save_path + "%s_%s.ckpt" % (epoch, int(test_accuracy * 100)))
                        break

            plt.plot(list(range(len(plt_data))), plt_data, color='b')
            plt.plot(list(range(len(test_accuracy_data))), test_accuracy_data, color='y')
            plt.show()

    def restore_model(self, model_path, model_name):
        saver = tf.train.import_meta_graph(os.path.join(model_path, model_name))
        saver.restore(self.session, tf.train.latest_checkpoint(model_path))

    @staticmethod
    def get_mini_batch(data, size, epoch):
        total_num = len(data)
        if total_num <= size:
            return data
        start_index = (size * epoch) % total_num
        end_index = (size * epoch + size) % total_num
        if start_index < end_index:
            res_data = data[start_index: end_index]
        else:
            res_data = np.r_[data[start_index:], data[:end_index]]

        return res_data


if __name__ == '__main__':

    rm = RnnModel(128, 3, 1, 100)
    sample_data = SF.sample_get('h5py/7-15.h5py')
    rm.run(sample_data, 50000, save_path='./save/7-15/terminal_', batch_size=256)

