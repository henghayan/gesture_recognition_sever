import sys

sys.path.append('../model')

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from datetime import datetime
import json
from predict import Predict
from sample import SF
app = Flask(__name__)
CORS(app)


p = Predict()
@app.route("/predict", methods=["POST"])
def predict():

    data = request.form.get('trace') or request.get_data()

    try:
        data = [json.loads(data)]
    except:
        return jsonify({"code": -1, 'msg': 'bad request', 'data': ''})
    if not (len(data) > 0 and data[0]):
        return jsonify({"code": -1, 'msg': 'bad request', 'data': ''})
    data = SF.trans_float_list(data)[0]
    data = SF.trace_normalize(data)
    if not (len(data) or len(data[0])):
        return jsonify({"code": 0, 'msg': 'success', 'data': False})
    res = p.run([data])

    return jsonify({"code": 0, 'msg': 'success', 'data': (int(res[0]) == 1)})


@app.route("/collect", methods=["POST"])
def collect():
    data = request.form.get('trace') or request.get_data()

    try:
        data = [json.loads(data)]
    except:
        return jsonify({"code": -1, 'msg': 'bad request', 'data': ''})
    if not (len(data) > 0 and data[0]):
        return jsonify({"code": -1, 'msg': 'bad request', 'data': ''})
    now = datetime.now()
    kind = request.form.get('type')
    print('kind', kind)
    if kind == 'negative':
        kind_str = 'fail'
    elif kind == 'gou':
        kind_str = 'success'
    elif kind == 'gou1':
        kind_str = 'success1'
    else:
        return jsonify({"code": -1, 'msg': '不要瞎激八搞我的样本'})

    file_name = 'sample_txt/%s_%s_%s_%s.txt' % (now.year, now.month, now.day, kind_str)

    with open(file_name, 'a+') as f:
        f.write(json.dumps(data[0]) + '\n')

    return jsonify({"code": 0, 'msg': 'success'})


@app.route("/index", methods=["get"])
def collect_get():
    print('request', request.args)
    kind = request.args.get('type')

    return render_template('verificationCode.html', **{'type': kind})

@app.route("/test", methods=["get"])
def test():

    return render_template('verificationCodeTest.html')



if __name__ == "__main__":
    app.run(host="0.0.0.0", threaded=False)
