import tensorflow as tf
import numpy as np
from sample import SF
from visualization import Visualization
import os

abs_path = os.path.dirname(__file__) or os.path.abspath('.')
gpu_options = tf.GPUOptions(per_process_gpu_memory_fraction=0.333)


class Predict:
    def __init__(self):
        self.sess = tf.Session(config=tf.ConfigProto(gpu_options=gpu_options))
        self.saver = tf.train.import_meta_graph(os.path.join(abs_path, "save/7-15/terminal_5300_98.ckpt.meta"))
        self.saver.restore(self.sess, tf.train.latest_checkpoint(os.path.join(abs_path, "save/7-15")))

    def run(self, data):

        data = np.array(data)
        print(data.shape)
        graph = tf.get_default_graph()
        x = graph.get_tensor_by_name("x:0")
        output = graph.get_tensor_by_name("output:0")
        predict = graph.get_tensor_by_name("predict:0")
        res = self.sess.run(predict,  feed_dict={x: data})
        print('res', res)
        return res

    def test(self):
        v = Visualization()
        l = v.file_path_get()
        data = v.data_get(l[1])[0]
        print('data======', data)
        v.show(data)
        data = SF.trans_float_list(data)
        data = SF.data_format([data])
        self.run(data)

    def test(self, data):
        data = SF.trace_normalize(data)
        res = self.run([data])
        return res


if __name__ == '__main__':
    p = Predict()
    test_data = [[0.33, 0.645, 14], [0.37, 0.6890000000000001, 29], [0.43, 0.755, 45], [0.46, 0.7879999999999999, 58], [0.52, 0.8539999999999999, 73], [0.56, 0.7339999999999999, 81], [0.6, 0.6139999999999999, 90], [0.64, 0.49399999999999994, 97], [0.68, 0.3739999999999999, 106], [0.74, 0.19399999999999992, 114], [0.77, 0.10399999999999991, 121]]
    res = p.test(test_data)
    print(res)
    # data = SF.sample_get('test.hdf5')['train_x']
    # sample_data = SF.sample_get('test.hdf5')
    # data = ['']
    # p.run(data)
