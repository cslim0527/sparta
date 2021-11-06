from operator import itemgetter
from bson.json_util import dumps
from flask import Flask, redirect, url_for, render_template, jsonify, request, session
import jwt
from datetime import datetime, timedelta
import hashlib
from pymongo import MongoClient
from bson.objectid import ObjectId

app = Flask(__name__)

client = MongoClient('mongodb://15.164.50.18', 27017, username="test", password="test")
db = client.good4y

# JWT 토큰을 만들 때 필요한 비밀문자열입니다. 아무거나 입력해도 괜찮습니다.
# 이 문자열은 서버만 알고있기 때문에, 내 서버에서만 토큰을 인코딩(=만들기)/디코딩(=풀기) 할 수 있습니다.
SECRET_KEY = 'SPARTA'


#################################
##  HTML을 주는 부분             ##
#################################

# 스케쥴 출력(메인화면)
@app.route('/')
def home():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        member = db.member.find_one({"id": payload['id']})['id']
        # area = db.member.find_one({"id": payload['id']})['area']  가입시 입력된 정보로 nx ny 찾아주기
        area = ["60", "126"]

        # 토큰정보(유저의 ID)를 통해 현재 접속자의 스케줄 데이터를 조회
        schd_data = list(db.schedule.find({'id': member}))

        for item in schd_data:
            # 시간 정보 AM/PM 포맷팅 (hh:mm -> ex) AM 10:30)
            item['time'] = datetime.strftime(datetime.strptime(item['time'], '%H:%M'), '%p %I:%M')

        return render_template('lists.html', schd_data=schd_data, area=area, userId=member)  # area = area => 지역정보 넘겨주기
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login"))


@app.route('/login')
def login():
    msg = request.args.get("msg")
    return render_template('login.html', msg=msg)


@app.route('/register')
def register():
    return render_template('register.html')


# 스케줄 작성페이지
@app.route('/write')
def write():
    token_receive = request.cookies.get('mytoken')
    u_id = request.args.get('u_id')
    if token_receive is not None:
        if u_id is not None:
            schedules = db.schedule.find_one({'_id': ObjectId(u_id)})
            return render_template('write.html', schedules=schedules)
        return render_template('write.html')
    else:
        return render_template('write.html', isLogin=False, msg='로그인 후 이용하세요.')


#################################
##  로그인을 위한 API            ##
#################################

# [회원가입 API]
# id, pw, nickname을 받아서, mongoDB에 저장합니다.
# 저장하기 전에, pw를 sha256 방법(=단방향 암호화. 풀어볼 수 없음)으로 암호화해서 저장합니다.
@app.route('/api/write', methods=['POST', 'GET'])
def api_write():
    token_receive = request.cookies.get('mytoken')  # 토큰 받아서 디코드
    payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])

    id_receive = payload['id']
    title_receive = request.form['title_give']
    content_receive = request.form['content_give']  # 추가 필요
    time1_receive = request.form['time1_give']  # time1 -> hour
    time2_receive = request.form['time2_give']  # time2 -> minute
    day_receive = request.form.getlist('day_give[]')
    doc = {
        "id": id_receive,
        "subject": title_receive,
        "time": time1_receive + ':' + time2_receive,  # 시간
        "day": day_receive,
        "content": content_receive
    }

    db.schedule.insert_one(doc)

    return jsonify({'result': 'success', 'msg': '작성되었습니다.'})


@app.route('/api/edit', methods=['POST'])
def api_edit():
    token_receive = request.cookies.get('mytoken')  # 토큰 받아서 디코드
    payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])

    id_receive = payload['id']
    _id = request.form['_id']
    title_receive = request.form['title_give']
    content_receive = request.form['content_give']  # 추가 필요
    time1_receive = request.form['time1_give']  # time1 -> hour
    time2_receive = request.form['time2_give']  # time2 -> minute
    day_receive = request.form.getlist('day_give[]')
    doc = {
        "id": id_receive,
        "subject": title_receive,
        "time": time1_receive + ':' + time2_receive,  # 시간
        "day": day_receive,
        "content": content_receive
    }

    db.schedule.update_one({'_id': ObjectId(_id)}, {'$set': doc})

    return jsonify({'result': 'success', 'msg': '수정되었습니다.'})


@app.route('/api/register', methods=['POST'])
def api_register():
    id_receive = request.form['id_give']
    pw_receive = request.form['pw_give']
    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()
    doc = {
        "id": id_receive,  # 아이디
        "pw": pw_hash,  # 비밀번호
    }
    db.member.insert_one(doc)
    return jsonify({'result': 'success'})


# 아이디 중복확인 서버
@app.route('/sign_up/check_dup', methods=['POST'])
def check_dup():
    id_receive = request.form['id_give']
    exists = bool(db.member.find_one({"id": id_receive}))
    return jsonify({'result': 'success', 'exists': exists})


# [로그인 API]
# id, pw를 받아서 맞춰보고, 토큰을 만들어 발급합니다.
@app.route('/api/login', methods=['POST'])
def api_login():
    # 로그인
    id_receive = request.form['id_give']
    pw_receive = request.form['pw_give']

    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()
    result = db.member.find_one({'id': id_receive, 'pw': pw_hash})

    if result is not None:
        payload = {
            'id': id_receive,
            'exp': datetime.utcnow() + timedelta(seconds=60 * 60 * 24)  # 로그인 24시간 유지
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256').decode('utf-8')

        return jsonify({'result': 'success', 'token': token})

    # 찾지 못하면
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})


# [리스트 삭제 API]
@app.route('/api/remove', methods=['POST'])
def api_remove():
    # 삭제 할 스케줄 리스트 저장
    # 타입: Array
    # 요소 값: 각 스케줄의 _id
    remove_list_receive = request.form.getlist('remove_list_give[]')

    # 삭제 할 스케줄 정보가 존재 할 경우
    if len(remove_list_receive):
        for item_id in remove_list_receive:
            # 리스트를 순회하며 스케줄 데이터를 삭제
            # [MEMO] MongoDB를 _id를 참조하여 다루게 될 경우 ObjectId 를 사용해야함
            db.schedule.delete_one({'_id': ObjectId(item_id)})
        return jsonify({'result': 'success'})
    # 삭제 할 스케줄 정보가 없을 경우
    else:
        return jsonify({'result': 'fail', 'msg': '선택된 스케줄이 없습니다.'})


# [리스트 정렬 API]
@app.route('/api/sort', methods=['POST'])
def api_sort():
    # 오늘 스케줄만 보기 기능이 선택되어 있을 경우인지 식별하는 값
    # 타입: String
    filtered_receive = request.form['filtered_give']

    # 2차 정렬 선택 값
    # 타입: String
    # 상세: 입력순 -> normal, 시간 빠른순 -> fast, 매주 우선순 -> week
    action_receive = request.form['action_give']

    # 오늘 스케줄만 보기중 일때
    if filtered_receive == 'filtered':

        # 정렬 후 배열을 저장 할 빈 Array
        arr = []

        # 오늘 스케줄 목록의 데이터값
        # 타입: Array
        # 요소 값: 각 스케줄의 _id
        now_receive = request.form.getlist('now_give[]')

        #  오늘 스케줄만 보기 && 입력순 정렬
        if action_receive == 'normal':
            for _id in now_receive:
                # 각 스케줄의 _id로 스케줄 전체 데이터를 조회
                listArr = db.schedule.find_one({'_id': ObjectId(_id)})

                # 빈 배열에 담아 클라이언트단으로 리턴
                arr.append(listArr)

            # [MEMO] jsonify가 이미 json 데이터를 내보내도록하는데 왜 오류가 나는지,
            # dumps()를 써서 되긴 했는데 왜 필요했는지 조금더 알아보기
            return jsonify({'result': dumps(arr)})

        #  오늘 스케줄만 보기 && 시간 빠른순 정렬
        elif action_receive == 'fast':
            for _id in now_receive:
                listArr = db.schedule.find_one({'_id': ObjectId(_id)})
                arr.append(listArr)

                # 시간정보를 오름차순으로 정렬
                arr = sorted(arr, key=itemgetter('time'))

            return jsonify({'result': dumps(arr)})

        #  오늘 스케줄만 보기 && 매주 우선순 정렬
        elif action_receive == 'week':
            for _id in now_receive:
                listArr = db.schedule.find_one({'_id': ObjectId(_id)})
                arr.append(listArr)

            # 재정렬을 위한 빈 배열 생성
            sortedArr = []

            # 역순으로 반복
            for i in range(len(arr), 0, -1):

                # 맨끝 스케줄 데이터부터 day 요소의 마지막 값이 false 일 경우
                # 매주(날짜)를 선택했는지 하지 않았는지 식별하기 위함
                if (arr[i - 1]['day'][-1] == 'false'):
                    # 매주 해야할 일이 아닌 경우 뒤쪽으로 정렬
                    sortedArr.append(arr[i - 1])
                else:
                    # 매주 해야할 일의 경우 앞쪽으로 정렬
                    sortedArr.insert(0, arr[i - 1])

            return jsonify({'result': dumps(sortedArr)})

    # 전체 스케줄 보기중 일때
    else:

        # 해당 유저의 전체 스케줄 데이터를 조회하기 위해 유저 ID값을 저장
        id_receive = request.form['id_give']

        # 유저 ID로 스케줄 전체 데이터를 조회
        filter_data = list(db.schedule.find({'id': id_receive}))

        # 전체보기 && 입력순
        if action_receive == 'normal':
            return jsonify({'result': dumps(filter_data)})

        # 전체보기 && 시간빠른순
        elif action_receive == 'fast':
            arr = sorted(filter_data, key=itemgetter('time'))
            return jsonify({'result': dumps(arr)})

        # 전체보기 && 매주 우선순
        elif action_receive == 'week':

            sortedArr = []

            for i in range(len(filter_data), 0, -1):
                if (filter_data[i - 1]['day'][-1] == 'false'):
                    sortedArr.append(filter_data[i - 1])
                else:
                    sortedArr.insert(0, filter_data[i - 1])
            return jsonify({'result': dumps(sortedArr)})


# [리스트 필터 API]
@app.route('/api/filter', methods=['POST'])
def api_filter():
    # 유저 ID값 저장
    id_receive = request.form['id_give']

    # 해당 유저의 스케줄 전체 데이터 조회
    filter_data = list(db.schedule.find({'id': id_receive}))

    return jsonify({'result': dumps(filter_data)})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
