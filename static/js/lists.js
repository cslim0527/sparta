(function () {
    const $removeModeBtn = $('#removeModeBtn')
    const $allSelBtn = $('#allSelBtn')
    const $backBtn = $('#backBtn')
    const $removeBtn = $('#removeBtn')

    // 삭제 모드 토글
    $removeModeBtn.click(function () {
        setBtnElem()
    })

    // 전체선택버튼
    $allSelBtn.click(function () {
        $(this).toggleClass('is-danger')

        if ($(this).hasClass('is-danger')) {
            $('input[id^="listItem"]').prop('checked', true)
        } else {
            $('input[id^="listItem"]').prop('checked', false)
        }
    })

    $backBtn.click(function () {
        setBtnElem()
    })

    $removeBtn.click(function () {
        const removeListArr = $.map($('.uid:checked'), function (input) {
            return $(input).val()
        })

        ajaxRemoveList(removeListArr)
    })

    function weather(date, time, nx, ny) { //기상청 api 조회하기
            serviceKey = 'OOH9Erw93X1Lk223Bku2k%2FdZPNnhauLD%2FC8%2BL%2Fy29Zhldy5YRVPPtpAz6PINeWy15lu1IPJ88xLqIHv9Orb9PA%3D%3D'
            baseDate = 20211104
            baseTime = 1100
            nx = 60
            ny = 127
            $.ajax({
                type: "GET",
                url: "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?ServiceKey="+serviceKey+"&base_date="+baseDate+"&base_time="+baseTime+"&nx="+nx+"&ny="+ny+"&pageNo=1&numOfRows=14&_type=json",
                data: {},
                success: function (response) {
                    console.log(response)
                }
            })
        }

    function ajaxRemoveList(removeListArr) {
        $.ajax({
            type: "POST",
            url: "/api/remove",
            data: {
                remove_list_give: removeListArr,
            },
            success: function (response) {
                if (response['result'] == 'success') {
                    alert('삭제되었습니다.')
                    window.location.href = '/'
                } else {
                    alert(response['msg'])
                }
            }
        })
    }

    function setBtnElem() {
        const state = $removeModeBtn.data('mode')
        const $beforeGroup = $('#beforeGroup')
        const $afterGroup = $('#afterGroup')

        if (state === 'on') {
            $beforeGroup.css('display', 'none')
            $afterGroup.css('display', 'flex')
            $removeModeBtn.data('mode', 'off')
            $('.schdItem').addClass('modify')
            $('.modItemBtn').css('display', 'none')
            $removeBtn.css('display', 'block')
        } else {
            $beforeGroup.css('display', 'flex')
            $afterGroup.css('display', 'none')
            $removeModeBtn.data('mode', 'on')
            $('.schdItem').removeClass('modify')
            $('.modItemBtn').css('display', 'block')
            $('input[id^="listItem"]').prop('checked', false)
            $allSelBtn.removeClass('is-danger')
            $removeBtn.css('display', 'none')
        }
    }
})()