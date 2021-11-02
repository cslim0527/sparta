(function() {
    const $removeModeBtn = $('#removeModeBtn')
    const $allSelBtn = $('#allSelBtn')
    const $backBtn = $('#backBtn')

    // 삭제 모드 토글
    $removeModeBtn.click(function () {
        setBtnElem()
    })

    // 전체선택버튼
    $allSelBtn.click(function() {
        $(this).toggleClass('is-danger')

        if ($(this).hasClass('is-danger')) {
             $('input[id^="listItem"]').prop('checked', true)
        } else {
            $('input[id^="listItem"]').prop('checked', false)
        }
    })

    $backBtn.click(function() {
        setBtnElem()
    })

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
        } else {
            $beforeGroup.css('display', 'flex')
            $afterGroup.css('display', 'none')
            $removeModeBtn.data('mode', 'on')
            $('.schdItem').removeClass('modify')
            $('.modItemBtn').css('display', 'block')
            $('input[id^="listItem"]').prop('checked', false)
            $allSelBtn.removeClass('is-danger')
        }
    }
})()