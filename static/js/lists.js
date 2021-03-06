(function () {
    const $removeModeBtn = $('#removeModeBtn')
    const $allSelBtn = $('#allSelBtn')
    const $backBtn = $('#backBtn')
    const $removeBtn = $('#removeBtn')
    const $todayFilterBtn = $('#todayFilterBtn')
    const $listWrap = $('#listWrap')
    const $listCtrls = $('#listCtrls')
    const $listSortSel = $('#listSortSel')
    const loadingSpinner = '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>'
    let nowListIds = []

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

    // 뒤로기가 버튼 클릭시
    $backBtn.click(function () {
        setBtnElem()
    })

    // 삭제버튼 클릭 시
    $removeBtn.click(function () {

        // 삭제 시 현재 선택되어있는 스케줄 리스트의 _id(고유값)을 배열로 저장
        const removeListArr = $.map($('.uid:checked'), function (input) {
            return $(input).val()
        })

        // 삭제 API로 배열값 전달
        ajaxRemoveList(removeListArr)
    })
    //기상청 api 조회하기(구현실패)
    //문제점 1. CORS 2. 주말의 정보가 금요일에 들어와 금요일의 데이터 정보량이 다른 요일에 비해 많아짐 -> 로딩속도 저하
    function weather(nx, ny) {
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
            success: function (response) {
                console.log(response)
            }
        })
    }

    // 리스트 삭제 API 호출
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

    // 삭제 모드 on/off 시 UI 세팅
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

    // 오늘 스케줄만 보기 버튼 클릭 시
    $todayFilterBtn.click(function () {
        const isActive = $(this).hasClass('is-danger')

        $(this).toggleClass('is-danger')

        if (isActive) {
            // [MEMO] $(selector).data('mode', 'filtered')
            // 다른 곳에서는 잘 먹히던 메서드가 왜 안되는지 확인해 볼것...

            // 오늘 스케줄만 보기 상태 off
            this.dataset.mode = ''
            $(this).text('오늘할일 보기')

            // 2차 정렬(select) 기본값으로 초기화
            $listSortSel.val('normal')

            // 오늘 스케줄만 필터링
            ajaxListFilter(false)
        } else {

            // 오늘 스케줄만 보기 상태 on
            this.dataset.mode = 'filtered'
            $(this).text('전체보기')

            // 2차 정렬(select) 기본값으로 초기화
            $listSortSel.val('normal')
            ajaxListFilter(true)
        }
    })

    $listSortSel.change(function () {
        // 2차 정렬 요소의 현재 선택값 추출
        const action = $(this).val()

        // sort api로 현재 action값 전달
        ajaxListSort(action)
    })

    function ajaxListSort(action) {
        // [MEMO] data-mode 값이 제대로 안잡힘..
        const filtered = document.getElementById('todayFilterBtn').dataset.mode

        $.ajax({
            type: "POST",
            url: "/api/sort",
            data: {
                id_give: $('#globalUserId').val(), // 유저 ID
                action_give: action, // 선택된 2차 정렬(select)의 현재 값
                filtered_give: filtered, // 오늘 스케줄 보기 활성화 상태
                now_give: nowListIds // 현재 보여지는 스케줄 리스트 정보
            },
            success: function (response) {
                // 서버단에서 넘어온 String을 JSON으로 파싱
                const data = JSON.parse(response.result)

                // 데이터를 리스트 템플릿으로 변환
                const allListHtmls = getAllLists(data)

                // 리스트 렌더링
                $listWrap.html(allListHtmls)
            }
        })
    }

    function getNowLists() {
        return $.map($('.schdItem'), function (item) {
            return $(item).find('.uid').val()
        })
    }

    // 오늘할일 보기 동작
    // 매개변수: filter -> 오늘 스케줄만보기(true)/전체스케줄(false) 보기 분기를 위한 식별값
    function ajaxListFilter(filter = true) {
        
        // 스케줄을 불러오기 전 로딩 이미지 노출
        $listWrap.html(loadingSpinner)
        
        // 로딩 시 해당 동작 버튼 비활성화
        $todayFilterBtn.attr('disabled', true)

        setTimeout(function () {
            $.ajax({
                type: "POST",
                url: "/api/filter",
                data: {
                    id_give: $('#globalUserId').val(),
                },
                success: function (response) {
                    const data = JSON.parse(response.result)

                    // 오늘 스케줄만 보기 일때
                    if (filter) {
                        // 현재 필터링 된 스케줄 정보의 템플릿 생성
                        const filteredListHtmls = getFilteredLists(data)
                        
                        // 템플릿 렌더링
                        $listWrap.html(filteredListHtmls)
                        
                        // 해당 기능 버튼 다시 활성화
                        $todayFilterBtn.attr('disabled', false)

                        // 오늘 스케줄만 보기 다중 정렬을 위한 초기 배열 상태 저장
                        nowListIds = getNowLists()

                    // 전체 스케줄 보기 일때
                    } else {
                        
                        // 전체 스케줄 정보의 템플릿 생성
                        const allListHtmls = getAllLists(data)
                        
                        // 템플릿 렌더링
                        $listWrap.html(allListHtmls)

                        // 해당 기능 버튼 다시 활성화
                        $todayFilterBtn.attr('disabled', false)
                    }
                }
            })
        }, 500)
    }

    // 오늘의 스케줄정보만 필터링
    function getFilteredLists(listArr) {
        
        // 현재 날짜의 인덱스값
        const dayIdx = getTodayIdx()
        
        // 템플릿을 담기위한 변수
        let htmls = ''
        
        
        for (let i = 0; i < listArr.length; i++) {
            // 현재 날짜를 체크했었는지 확인
            const isToday = listArr[i].day[dayIdx] === 'true'
            
            // 체크한적이 없다면 다음으로
            if (!isToday) continue

            // 체크 된 날짜의 데이터만 템플릿 생성
            htmls += getListHtmls(listArr[i])
        }
        return htmls
    }

    // 전체 스케줄 데이터의 템플릿 생성
    function getAllLists(listArr) {
        // 각 스케줄의 데이터를 순회
        return listArr.reduce((html, item, idx) => {
            // 각 스케줄의 템플릿 생성
            return html += getListHtmls(item, idx)
        }, '')
    }

    // 날짜 인덱스 재설정
    // js 날짜 정보는 0번째가 일요일이므로 월요일이 0번째로 매칭되도록 함
    function getTodayIdx() {
        const dayIdx = new Date().getDay()
        return dayIdx - 1 <= 0 ? 6 : dayIdx - 1
    }

    // 각 스케줄 템플릿 생성
    // 매개변수: Array (스케줄정보), Number (인덱스)
    function getListHtmls(data, idx) {
        // 날짜 정보 템플릿 생성
        const daysTemp = getDayIconTemp(data.day)

        // 시간 포맷 변경 (ex: 19:00 -> PM 07:00)
        const formattedTime = getAMPM(data.time)

        // 해당 스케줄의 데이터를 삽입
        return `<li class="schd-item schdItem">
                    <div class="round-cb">
                        <input type="checkbox" id="listItem${idx}" value="${data._id.$oid}" class="uid">
                        <label for="listItem${idx}" class="fas fa-check-circle"></label>
                    </div>
                    
                    <div class="days">${daysTemp}</div>

                    <strong class="title textover">${data.subject}</strong>
                    <small class="time"><b>${formattedTime.AMPM} ${formattedTime.HHMM}</b></small>
                    <p class="summary textover">${data.content}</p>
                    <a href="/write?u_id=${data._id.$oid}" class="mod-item-btn modItemBtn">
                        <i class="fas fa-pencil-alt"></i>
                    </a>
                </li>`
    }

    // 시간 포맷 변경 (moment.js 라이브러리 사용)
    function getAMPM(time) {
        const today = moment().format('YYYY-MM-DD')
        const fullDate = `${today} ${time}`
        const AMPM = moment(fullDate).format('A')
        const HHMM = moment(fullDate).format('hh:mm')
        return {
            AMPM,
            HHMM
        }
    }

    // 날짜 템플릿 생성
    function getDayIconTemp(dayArr) {
        let dayText = ['월', '화', '수', '목', '금', '토', '일', '매주']
        
        // 각 날짜정보를 순회하며 한글화 및 매주 스케줄일 경우 템플릿 변환
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