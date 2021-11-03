function schedule() {
    var day = $('input[name="day"]');
    var days = $.map(day, function (v) {
            return v.checked
        }
    );


    let time1 = $('#schedule-time1').val();
    let time2 = $('#schedule-time2').val();
    // let option = $('#schedule-option').val();
    let title = $('#schedule-title').val();
    let content = $('#schedule-content').val();

    if (title == "") {
        $("#schedule-title").text("제목을 입력해주세요.").removeClass("is-safe").addClass("is-danger")
        $("#schedule-title").focus()
        return;
    }

    if (content == "") {
        $("#schedule-content").text("제목을 입력해주세요.").removeClass("is-safe").addClass("is-danger")
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
            // window.location.reload()
        }
    })
}


$('#apply').click(function () {

});

