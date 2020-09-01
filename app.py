from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient

# from google.oauth2 import id_token
# from google.auth.transport import requests


app = Flask(__name__)

client = MongoClient('mongodb://cielo415:ghcjf7848@15.164.94.7',27017)  # mongoDB는 27017 포트로 돌아갑니다.
db = client.dbusstock  # 'dbsparta'라는 이름의 db를 만들거나 사용합니다.


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/portfolio')
def table():
    return render_template('table.html')

@app.route('/login')
def log_in():
    return render_template('login.html')

@app.route('/addTicker')
def add_ticker():
    return render_template('popup_add_ticker.html')

@app.route('/editTicker')
def edit_ticker():
    return render_template('popup_edit_ticker.html')

@app.route('/api/addStocks', methods=['POST'])
def add_stocks():
    # 1. 클라이언트로부터 데이터를 받기
    # author_receive로 클라이언트가 준 author 가져오기

    ticker_receive = request.form['ticker_give']
    avg_price_receive = request.form['avg_price_give']
    quantity_receive = request.form['quantity_give']

    # db내의 ticker값 중복체크

    doc = {
        'ticker': ticker_receive,
        'avg_price': avg_price_receive,
        'quantity': quantity_receive
    }

    # Db에 데이터 넣기
    db.stocks.insert_one(doc)

    # 3. mongoDB에 데이터 넣기
    return jsonify({'result': 'success', 'msg': '저장이 완료되었습니다!'})


@app.route('/api/readStocks', methods=['GET'])
def show_stocks():
    # 1. mongoDB에서 _id 값을 제외한 모든 데이터 조회해오기(Read)
    stocks = list(db.stocks.find({}, {'_id': False}))
    # 2. articles라는 키 값으로 articles 정보 보내주기
    return jsonify({'result': 'success', 'stocks': stocks})


@app.route('/api/editStocks', methods=['UPDATE'])
def edit_stocks():
    ticker_receive = request.form['ticker_edit']
    avg_price_receive = request.form['avg_price_edit']
    quantity_receive = request.form['quantity_edit']

    db.stocks.update_one({'ticker': ticker_receive},
                         {'$set': {'avg_price': avg_price_receive, 'quantity': quantity_receive}})
    return jsonify({'result': 'success', 'msg': ticker_receive + '가 변경되었습니다'})


@app.route('/api/deleteStocks', methods=['DELETE'])
def delete_stocks():
    # 1. 클라이언트가 전달한 name_give를 name_receive 변수에 넣습니다.
    ticker_receive = request.form['ticker_delete']
    # 2. mystar 목록에서 delete_one으로 name이 name_receive와 일치하는 star를 제거합니다.
    db.stocks.delete_one({'ticker': ticker_receive})
    # 3. 성공하면 success 메시지를 반환합니다.
    return jsonify({'result': 'success', 'msg': ticker_receive + '가 정상적으로 삭제되었습니다'})



# Google Login 창

#
# # (Receive token by HTTPS POST)
# # ...
#
# try:
#     # Specify the CLIENT_ID of the app that accesses the backend:
#     idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
#
#     # Or, if multiple clients access the backend server:
#     # idinfo = id_token.verify_oauth2_token(token, requests.Request())
#     # if idinfo['aud'] not in [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]:
#     #     raise ValueError('Could not verify audience.')
#
#     # If auth request is from a G Suite domain:
#     # if idinfo['hd'] != GSUITE_DOMAIN_NAME:
#     #     raise ValueError('Wrong hosted domain.')
#
#     # ID token is valid. Get the user's Google Account ID from the decoded token.
#     userid = idinfo['sub']
# except ValueError:
#     # Invalid token
#     pass


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
