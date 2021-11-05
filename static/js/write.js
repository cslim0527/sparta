function schedule() {
    var day = $('input[name="day"]');
    var days = $.map(day, function (v) {
            return v.checked
        }
    );

    var d = $('input[name="day"]:checked')
    console.log(d.length)

    if (d.length == 0) {
        alert("요일을 체크해주세요.")
        return;
    }

    let time1 = $('#schedule-time1').val();
    let time2 = $('#schedule-time2').val();
    let title = $('#schedule-title').val();
    let content = $('#schedule-content').val();


    if (title == "") {
        $("#schedule-title").removeClass("is-safe").addClass("is-danger")
        $("#schedule-title").focus()
        return;
    }

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
            // window.location.reload()
        }
    })
}


$('#apply').click(function () {

});

function edit() {
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

