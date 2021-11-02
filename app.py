from flask import Flask, redirect, url_for, render_template, jsonify, request
import jwt
import datetime
app = Flask(__name__)
import hashlib
from pymongo import MongoClient

client = MongoClient('mongodb://test:test@localhost', 27017)
db = client.good4y
SECRET_KEY = 'sparta'
#스케쥴 출력(메인화면)
@app.route('/')
def home():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.member.find_one({"email": payload['email']})
        return render_template('index.html', nickname=user_info["nick"])
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))

@app.route('/login')
def login():
#    msg = request.args.get("msg")
    return render_template('login.html')
# 필요 DB member, schedule

# 회원 가입
@app.route('/membership')
def register():
    return render_template('membership.html')



@app.route('/sign_up/save', methods=['POST'])
def sign_up():
    email_receive = request.form['email_give']
    password_receive = request.form['pw_give']
    doc = {
        "email": email_receive,
        "password": password_receive,
    }
    db.member.insert_one(doc)
    return jsonify({'result': 'success'})

@app.route('/sign_up/check_dup', methods=['POST'])
def check_dup():
    email_receive = request.form['email_give']
    exists = bool(db.member.find_one({"email": email_receive}))
    return jsonify({'result': 'success', 'exists': exists})

#login api
@app.route('/api/login', methods=['POST'])
def api_login():
    id_receive = request.form['id_give']
    pw_receive = request.form['pw_give']

    result = db.member.find_one({'email': id_receive, 'pw': pw_receive})

    if result is not None:
        return jsonify({'result': 'success', 'msg': '성공'})
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})


#스케줄 입력하기(로그인 후 스케줄 추가)
@app.route('/api/schedule', methods=['POST'])
def addSchedule():
    day_receive = request.form['day_give']
    week_receive = request.form['week_give']
    title_receive = request.form['title_give']
    content_receive = request.form['content_give']

#어떤 스케쥴?? daily, weekly는 True, false
    doc = {
        'dailyCheck': day_receive,
        'weeklyCheck': week_receive,
        'content': content_receive,
        'title': title_receive
    }
    #스케쥴 저장
    db.schedule.insert_one(doc)

    return jsonify({'msg': '저장 완료!'})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)