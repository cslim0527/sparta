//사용자가 작성한 내용 db에 보내주기
function schedule() {
    //iput checkbox를 name으로 한번에 불러오기
    var day = $('input[name="day"]');
    //input을 반복처리 실행, 배열형태로 체크여부 추출
    var days = $.map(day, function (inputCheck) {
            return inputCheck.checked
        }
    );

    //요일 체크박스가 선택되지 않았을 경우 alert 띄워주기

    //input의 name으로 불러온 값이 체크가 되어있는지 확인
    var check = $('input[name="day"]:checked')

    //체크된 값의 길이가 0이면(체크값이 없으면) 요일을 체크해주세요 alert띄우고 return
    if (check.length == 0) {
        alert("요일을 체크해주세요.")
        return;
    }

    //저장시킬 항목들 value 저장
    let time1 = $('#schedule-time1').val();
    let time2 = $('#schedule-time2').val();
    let title = $('#schedule-title').val();
    let content = $('#schedule-content').val();

    //사용자가 제목 작성하지 않았을 때 focus해주기
    if (title == "") {
        $("#schedule-title").removeClass("is-safe").addClass("is-danger")
        $("#schedule-title").focus()
        return;
    }

    //사용자가 내용 작성하지 않았을 때 focus해주기
    if (content == "") {
        $("#schedule-content").removeClass("is-safe").addClass("is-danger")
        $("#schedule-content").focus()
        return;
    }

    $.ajax({
        type: "POST",
        url: "/api/write",
        data: {
            time1_give: time1,
            time2_give: time2,
            title_give: title,
            content_give: content,
            day_give: days
        },
        success: function (response) {
            alert(response["msg"]);
            window.location.href = '/'
        }
    })
}


$('#apply').click(function () {

});

//사용자가 수정한 내용 db에 보내주기
function edit() {
    //url 쿼리 문자열에서 처음부터 1번째까지 의 값을 가져오기
    let params = new URLSearchParams(document.location.search.substring(1))
    //params의 u_id값 가져오기
    let u_id = params.get("u_id")

    var day = $('input[name="day"]');

    var days = $.map(day, function (v) {
            return v.checked
        }
    );

    let time1 = $('#schedule-time1').val();
    let time2 = $('#schedule-time2').val();
    let title = $('#schedule-title').val();
    let content = $('#schedule-content').val();

    $.ajax({
        type: "POST",
        url: "/api/edit",
        data: {
            _id: u_id,
            time1_give: time1,
            time2_give: time2,
            title_give: title,
            content_give: content,
            day_give: days
        },
        success: function (response) {
            alert(response["msg"]);
            window.location.href = '/'
        }
    })

}

