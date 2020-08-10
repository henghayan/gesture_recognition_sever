import h5py
import numpy as np
import os
import json
import random
import sys
import traceback

sys.path.append('../')
abs_path = os.path.dirname(__file__) or os.path.abspath('.')
suc_path_list = ['../server/sample_txt/2019_6_26_success.txt', '../server/sample_txt/2019_6_27_success.txt',
                 '../server/sample_txt/2019_6_27_success_extra.txt', '../server/sample_txt/2019_6_28_success.txt',
                 '../server/sample_txt/2019_6_28_success1.txt', '../server/sample_txt/2019_6_29_success.txt',
                 '../server/sample_txt/2019_6_30_success.txt', '../server/sample_txt/2019_7_4_success.txt']

fail_path_list = ['../server/sample_txt/fail.txt', '../server/sample_txt/2019_7_4_fail.txt',
                  '../server/sample_txt/2019_6_28_fail.txt', '../server/sample_txt/fail_machine.txt',
                  '../server/sample_txt/2019_7_4_fail.txt', '../server/sample_txt/2019_7_5_fail.txt'
                  ]
less_fail = ['../server/sample_txt/fail.txt', '../server/sample_txt/2019_7_4_fail.txt',
             '../server/sample_txt/fail_machine.txt']
organize_fail = ['../server/sample_txt/fail.txt', '../server/sample_txt/fail_organize.txt']
test_path_list = ['../server/sample_txt/test.txt', ]

only_person_suc = ['../server/sample_txt/2019_6_26_success.txt', '../server/sample_txt/2019_6_27_success.txt',
                   '../server/sample_txt/2019_6_27_success_extra.txt', '../server/sample_txt/2019_6_28_success.txt',
                   '../server/sample_txt/2019_6_29_success.txt', '../server/sample_txt/2019_6_30_success.txt', ]

pre_suc_list = ['../server/sample_txt/2019_6_26_success.txt', '../server/sample_txt/2019_6_27_success.txt',
                '../server/sample_txt/2019_6_27_success_extra.txt', '../server/sample_txt/2019_6_28_success.txt',
                '../server/sample_txt/2019_6_28_success1.txt']
single_pre_suc_list = ['../server/sample_txt/2019_6_26_success.txt', '../server/sample_txt/2019_6_27_success.txt',
                       '../server/sample_txt/2019_6_27_success_extra.txt', '../server/sample_txt/2019_6_28_success.txt']


class SampleFormatter:
    def __init__(self, dir_path=None):
        self.path = dir_path if dir_path else abs_path

    # 由于初步样本较小，可以生成h5py 文件来进行临时储存，缩短样本格式化及初始化时间
    def h5py_generate(self, h5_name, center=False, time_normal=False, suc_path_list=suc_path_list, fail_path_list=fail_path_list):

        suc_data = self.txt_trans_data(suc_path_list, center=center, time_normal=time_normal)
        # print('suc_data', suc_data)
        train_suc_x = suc_data['train_x']
        test_suc_x = suc_data['test_x']
        train_suc_y = np.ones([train_suc_x.shape[0]])
        test_suc_y = np.ones([test_suc_x.shape[0]])

        fail_data = self.txt_trans_data(fail_path_list, center=center, time_normal=time_normal)
        train_fail_x = fail_data['train_x']
        test_fail_x = fail_data['test_x']
        train_fail_y = np.zeros([train_fail_x.shape[0]])
        test_fail_y = np.zeros([test_fail_x.shape[0]])

        train_x = np.r_[train_suc_x, train_fail_x]   # np.r_  numpy 多维度拼接
        train_y = np.r_[train_suc_y, train_fail_y]

        test_x = np.r_[test_suc_x, test_fail_x]
        # test_x = self.centralization(test_x)
        test_y = np.r_[test_suc_y, test_fail_y]

        temp = []
        for i in range(len(train_x)):
            temp.append([train_x[i], train_y[i]])
        train_sample_x = []
        train_sample_y = []
        np.random.shuffle(temp)
        for a, b in temp:
            train_sample_x.append(a)
            train_sample_y.append(b)
        train_sample_y = np.array(train_sample_y)
        train_sample_x = np.array(train_sample_x)

        with h5py.File(h5_name, 'w') as f:
            f.create_dataset('train_x', data=train_sample_x)  #储存至H5py
            f.create_dataset('train_y', data=train_sample_y)
            f.create_dataset('test_x', data=test_x)
            f.create_dataset('test_y', data=test_y)

    def trans_float_list(self, str_list):   #递归，处理txt解析文本多维度str 转化为 float
        if not isinstance(str_list, list):
            raise
        if isinstance(str_list[0], list):
            res_list = []
            for i in str_list:
                temp_data = self.trans_float_list(i)
                res_list.append(temp_data)
            return res_list
        else:
            return list(map(lambda x: float(x), str_list))

    def data_get(self, file_path):  #从本文解析 轨迹 数组
        data = []
        with open(file_path, 'r') as suc_file:
            trace_list = suc_file.read().split('\n')
            for i in trace_list:
                if i == '':
                    continue
                try:
                    temp_val = json.loads(i)
                    temp_val = self.trans_float_list(temp_val)
                    data.append(temp_val)
                except Exception as e:
                    pass
        return data

    def txt_trans_data(self, file_path_list, center=False, time_normal=False):
        total_suc_data = ''
        for i in file_path_list:
            temp_data = self.data_get(os.path.join(self.path, i))
            if total_suc_data:
                total_suc_data.extend(temp_data)
            else:
                total_suc_data = temp_data
        # print('total_suc_data--------------------', total_suc_data)
        # total_suc_data = self.data_format(total_suc_data, center=center, time_normal=time_normal)
        # total_suc_data = list(map(lambda x: self.trace_normalize(x), total_suc_data))
        temp = []
        for i in total_suc_data:
            # print('-i---------------', i)
            a = self.trace_normalize(i)
            if a:
                temp.append(a)
            # print('a===========', a)
        total_suc_data = temp

        # print('total_suc_data', total_suc_data)
        # print('len(total_suc_data)', len(total_suc_data))
        split_data = self.split_test_set(total_suc_data)

        train_suc_data = split_data['train_x']
        test_suc_data = split_data['test_x']

        train_suc_data = np.array(train_suc_data)
        test_suc_data = np.array(test_suc_data)
        return {
            'train_x': train_suc_data,
            'test_x': test_suc_data
        }

    def test_data_get(self):   #生成测试样本
        test_data = self.data_get(os.path.join(self.path))

        test_data = self.data_format(test_data)

        return test_data

    def h5file_check(self, file_path):
        data = self.sample_get(file_path)
        train_x = data['train_x']
        train_y = data['train_y']
        test_x = data['test_x']
        test_y = data['test_y']
        # print('train_x.shape', train_x.shape)
        # print('train_y.shape', train_y.shape)
        # print('test_x.shape', test_x.shape)
        # print('test_y.shape', test_y.shape)

    # 格式化样本，逻辑为超过100 随机删除， 低于100 ，复制最后一个至100个
    def data_format(self, data, center=False, time_normal=False):
        format_data = []
        for data_index in range(len(data)):
            per_data = data[data_index]
            if time_normal:
                per_data = self.time_normalization(per_data)
            if center:
                per_data = self.centralization(per_data)
                per_data = per_data.tolist()
            data_length = len(per_data)
            if data_length == 0:
                continue
            if data_length < 100:
                repeat_sample = per_data[-1]
                # print('repeat_sample', repeat_sample)
                repeat_sample[2] = 0
                temp_data = [repeat_sample] * (100 - data_length)
                per_data.extend(temp_data)
            if data_length > 100:
                remain_del = data_length - 100
                for i in range(remain_del):
                    random_index = random.randint(0, len(per_data) - 1)
                    del per_data[random_index]
            format_data.append(per_data)
        return format_data

    def __read_file(self, file):
        data = []
        with open(file, 'r') as suc_file:
            trace_list = suc_file.read().split('\n')
            for i in trace_list:
                if i == '':
                    continue
                try:
                    temp_val = json.loads(i)
                    temp_val = self.track_to_float(temp_val)
                    data.append(temp_val)
                except:
                    traceback.print_exc()
        print('num', len(data))
        return data

    @staticmethod
    def track_to_float(track):
        if not isinstance(track, list):
            raise TypeError()
        temp_track = []
        for a, b, c in track:
            temp_track.append([float(a), float(b), float(c)])
        return temp_track

    @staticmethod
    def sample_get(h5_name):
        with h5py.File(h5_name, 'r') as f:
            data = {}
            data['train_x'] = np.array(f['train_x'])
            data['train_y'] = np.array(f['train_y'])
            data['test_x'] = np.array(f['test_x'])
            data['test_y'] = np.array(f['test_y'])

            return data

    @staticmethod
    def split_test_set(data):
        total_num = len(data)
        total_index = np.array(range(total_num))
        data = np.array(data)
        test_num = total_num // 5
        test_index = np.random.choice(total_num, test_num, False)
        train_index = np.delete(total_index, test_index)
        train_data = data[train_index]
        test_data = data[test_index]
        return {
            'train_x': train_data,
            'test_x': test_data
        }

    @staticmethod
    def centralization(data):

        data = np.array(data)
        average_data = np.mean(data, axis=0, keepdims=True)
        average_data[0][2] = 0.5
        res_data = data - average_data + 0.5

        return res_data

    @staticmethod
    def time_normalization(data):

        index_list = [i for i in range(1, len(data))]
        index_list.reverse()
        for index in index_list:
            # if data[index][2] > 100
            data[index][2] -= data[index-1][2]

        return data

    def h5py_generate_test(self, h5_name, center=False):
        suc_data = self.txt_trans_data(test_path_list, center)
        train_x = suc_data['train_x']
        with h5py.File(h5_name, 'w') as f:
            f.create_dataset('train_x', data=train_x)  # 储存至H5py
            f.create_dataset('train_y', data='')
            f.create_dataset('test_x', data='')
            f.create_dataset('test_y', data='')

    @staticmethod
    def trace_normalize(trace):
        if len(trace) <= 5:
            return []
        max_x = 0
        min_x = 1
        max_y = 0
        min_y = 1

        while len(trace) > 100:
            random_index = random.randint(0, len(trace) - 1)
            del trace[random_index]

        while len(trace) < 100:
            obj_copy = trace[-1].copy()
            trace.append(obj_copy)

        collect_t = 0  # 先找出最大的几个点
        map_t = []
        for x, y, t in trace:
            max_x = max(max_x, x)
            max_y = max(max_y, y)
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            map_t.append(collect_t)
            collect_t = t
        if max_x - min_x == 0 or max_y - min_y == 0:
            return []

        for i in range(len(trace)):
            trace[i][0] = (trace[i][0] - min_x) / (max_x - min_x)
            trace[i][1] = (trace[i][1] - min_y) / (max_y - min_y)
            temp = min(trace[i][2] - map_t[i], 100)
            trace[i][2] = temp
            trace[i][2] = temp / 100.0

        return trace


SF = SampleFormatter()
# SF.h5py_generate('test.hdf5')

if __name__ == '__main__':
    S = SampleFormatter()
    # S.__read_file('../server/sample_txt/2019_7_4_fail.txt')
    # S.h5py_generate('2019_6_28_less_fail.h5py')
    # S.h5file_check('2019_6_28_less_fail.h5py')

    # data = S.sample_get('2019_6_28_less_fail.h5py')
    # res = S.centralization(data['test_x'])
    # print(res)

    # S.h5py_generate('2019_7_2_normal_center.h5py', True)
    # S.h5py_generate('2019_7_2_less_fail_center.h5py', True, fail_path_list=less_fail)
    # S.h5py_generate('2019_7_2_person_less_fail_center.h5py', True, suc_path_list=only_person_suc, fail_path_list=less_fail)
    # S.h5py_generate_test('2019_6_28_less_fail_no_center.h5py')
    # S.h5py_generate('h5py/2019_7_2_normal_center_less_fail.h5py', True, True, suc_path_list=suc_path_list, fail_path_list=less_fail)
    S.h5py_generate('h5py/7-15.h5py', suc_path_list=suc_path_list, fail_path_list=fail_path_list)
