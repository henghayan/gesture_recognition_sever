import matplotlib.pyplot as plt
import json
import os
from sample import SF
import sys
sys.path.append('../')


class Visualization:
    def __init__(self):
        self.abspath = os.path.dirname(__file__) or os.path.abspath('.')

    def data_get(self, file_path):   #从本文解析 轨迹 数组
        data = []
        with open(file_path, 'r') as suc_file:
            print('suc_file', suc_file.read())
            for i in suc_file.read().split('\n'):
                if i == '':
                    continue
                try:
                    temp_val = json.loads(i)
                    temp_val = self.trans_float_list(temp_val)
                    data.append(temp_val)
                except:
                    pass

        return data

    def trans_float_list(self, str_list):   #递归，处理txt解析文本多维度str 转化为 float

        if isinstance(str_list[0], list):
            res_list = []
            for i in str_list:
                temp_data = self.trans_float_list(i)
                res_list.append(temp_data)
            return res_list
        else:
            return list(map(lambda x: float(x), str_list))

    def h5_file_show(self, file_path):
        data = SF.sample_get(file_path)['train_x']
        c = 0
        for i in data:
            print('----------%s-----------' % c)
            self.show(i)
            c += 1

    def txt_file_show(self, file_path):
        data = SF.data_get(file_path)
        data = SF.trans_float_list(data)

        c = 0
        print('----------------条数：%s----------------' % len(data))
        for i in data:
            print('----------%s-----------' % c)
            self.show(i)
            c += 1

    @staticmethod
    def show(sample):
        arr_x = []
        arr_y = []
        for x, y, t in sample:
            arr_x.append(float(x) * 100)
            arr_y.append((1 - float(y)) * 100)

        plt.xlim((0, 100))
        plt.ylim((0, 100))
        plt.plot(arr_x, arr_y, alpha=0.6)
        plt.show()

    @staticmethod
    def file_path_get(self, path=None):
        path = path if path else os.path.abspath('.')
        path = os.path.join(path, '../server/sample_txt/')
        path_list = os.listdir(path)
        txt_list = []
        for i in path_list:
            if 'success' in i or 'fail' in i:
                txt_list.append(os.path.join(path, i))
        return txt_list


if __name__ == '__main__':

    v = Visualization()
    # path = os.path.join(v.abspath, 'web\\server\\sample_txt\\2019_6_27_success_extra.txt')
    # # path = 'H:/deep_learning/web/server/sample_txt/2019_6_26_success.txt'
    # v.txt_file_show(path)
    # v.h5_file_show('2019_6_28_less_fail_center.h5py')
    v.txt_file_show('../server/sample_txt/fail_machine.txt')