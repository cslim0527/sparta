(function () {
    const $removeModeBtn = $('#removeModeBtn')
    const $allSelBtn = $('#allSelBtn')
    const $backBtn = $('#backBtn')
    const $removeBtn = $('#removeBtn')
    const $todayFilterBtn = $('#todayFilterBtn')
    const $listWrap = $('#listWrap')
    const $listCtrls = $('#listCtrls')
    const $listSortSel = $('#listSortSel')

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

    function weather(nx, ny) { //기상청 api 조회하기
        var today = new Date();
        var hours = ('0' + today.getHours()).slice(-2);
        var minutes = ('0' + today.getMinutes()).slice(-2);
        var timeString = hours + minutes
        var year = today.getFullYear();
        var month = ('0' + (today.getMonth() + 1)).slice(-2);
        var day = ('0' + today.getDate()).slice(-2);
        var dateString = year + month + day;

        serviceKey = 'OOH9Erw93X1Lk223Bku2k%2FdZPNnhauLD%2FC8%2BL%2Fy29Zhldy5YRVPPtpAz6PINeWy15lu1IPJ88xLqIHv9Orb9PA%3D%3D'
        baseDate = dateString
        baseTime = timeString

        $.ajax({
            type: "GET",
            url: "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?ServiceKey=" + serviceKey + "&base_date=" + baseDate + "&base_time=" + baseTime + "&nx=" + nx + "&ny=" + ny + "&pageNo=1&numOfRows=14&_type=json",
            data: {},
            success: function (response) {}
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

        if (state === 'on') { // 삭제 진행시
            $beforeGroup.css('display', 'none')
            $afterGroup.css('display', 'flex')
            $removeModeBtn.data('mode', 'off')
            $('.schdItem').addClass('modify')
            $('.modItemBtn').css('display', 'none')
            $removeBtn.css('display', 'block')
            $listCtrls.css('display', 'none')
        } else {
            $beforeGroup.css('display', 'flex')
            $afterGroup.css('display', 'none')
            $removeModeBtn.data('mode', 'on')
            $('.schdItem').removeClass('modify')
            $('.modItemBtn').css('display', 'block')
            $('input[id^="listItem"]').prop('checked', false)
            $allSelBtn.removeClass('is-danger')
            $removeBtn.css('display', 'none')
            $listCtrls.css('display', 'flex')
        }
    }

    $todayFilterBtn.click(function () {
        const isActive = $(this).hasClass('is-danger')

        $(this).toggleClass('is-danger')

        if (isActive) {
            // [MEMO] $(selector).data('mode', 'filtered')
            // 다른 곳에서는 잘 먹히던 메서드가 왜 안되는지 확인해 볼것...
            this.dataset.mode = ''
            $(this).text('금일 스케줄 보기')
            ajaxListFilter(false)
        } else {
            this.dataset.mode = 'filtered'
            $(this).text('전체보기')
            ajaxListFilter(true)
        }
    })

    function ajaxListSort(action) {
        // [MEMO] data-mode 값이 제대로 안잡힘..
        const filtered = document.getElementById('todayFilterBtn').dataset.mode
        const nowListIds = getNowLists()

        $.ajax({
            type: "POST",
            url: "/api/sort",
            data: {
                id_give: $('#globalUserId').val(),
                action_give: action,
                filtered_give: filtered,
                now_give: nowListIds
            },
            success: function (response) {
                console.log(response)
                // const data = JSON.parse(response.result)
                // console.log(data)
                // const allListHtmls = getAllLists(data)
                // $listWrap.html(allListHtmls)
            }
        })
    }

    function getNowLists() {
        return $.map($('.schdItem'), function (item) {
            return $(item).find('.uid').val()
        })
    }

    $listSortSel.change(function () {
        const action = $(this).val()
        ajaxListSort(action)
    })

    // 오늘할일 보기 동작
    function ajaxListFilter(filter = true) {
        $.ajax({
            type: "POST",
            url: "/api/filter",
            data: {
                id_give: $('#globalUserId').val(),
            },
            success: function (response) {
                const data = JSON.parse(response.result)
                if (filter) {
                    const filteredListHtmls = getFilteredLists(data)
                    $listWrap.html(filteredListHtmls)
                } else {
                    const allListHtmls = getAllLists(data)
                    $listWrap.html(allListHtmls)
                }
            }
        })
    }

    function getFilteredLists(listArr) {
        const dayIdx = getTodayIdx()
        let htmls = ''
        for (let i = 0; i < listArr.length; i++) {
            const isToday = listArr[i].day[dayIdx] === 'true'
            if (!isToday) continue

            htmls += getListHtmls(listArr[i])
        }
        return htmls
    }

    function getAllLists(listArr) {
        return listArr.reduce((html, item) => {
            return html += getListHtmls(item)
        }, '')
    }

    function getTodayIdx() {
        const dayIdx = new Date().getDay()
        return dayIdx - 1 <= 0 ? 6 : dayIdx - 1
    }

    function getListHtmls(data) {
        let i = 1
        const daysTemp = getDayIconTemp(data.day)

        return `<li class="schd-item schdItem">
                    <div class="round-cb">
                        <input type="checkbox" id="listItem${i++}" value="${data._id.$oid}" class="uid">
                        <label for="listItem${i++}" class="fas fa-check-circle"></label>
                    </div>
                    
                    <div class="days">${daysTemp}</div>

                    <strong class="title textover">${data.subject}</strong>
                    <small class="time"><b>PM 12:00</b></small>
                    <p class="summary textover">${data.content}</p>
                    <a href="/write?u_id=${data._id.$oid}" class="mod-item-btn modItemBtn">
                        <i class="fas fa-pencil-alt"></i>
                    </a>
                </li>`
    }

    function getDayIconTemp(dayArr) {
        let dayText = ['월', '화', '수', '목', '금', '토', '일', '매주']
        return dayArr.reduce((html, item, idx) => {
            let el = ''
            if (dayText[idx] === '매주') {
                el = item === 'true' ? `<span class="icon-day every-week has-background-danger">${dayText[idx]}</span>` : ''
            } else {
                el = item === 'true' ? `<span class="icon-day has-background-light">${dayText[idx]}</span>` : ''
            }

            return html += el
        }, '')
    }

})()