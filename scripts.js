document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    const notifications = document.getElementById('notifications');
    const sessionRecords = document.getElementById('session-records');
    const hourlyReservations = document.getElementById('hourly-reservations');
    const matchBookingForm = document.getElementById('matchBookingForm');
    const matchNotifications = document.getElementById('matchNotifications');

    bookingForm?.addEventListener('submit', function(event) {
        event.preventDefault();
        const customerName = document.getElementById('customerName').value;
        const sessionNumber = document.getElementById('sessionNumber').value;
        const rentalTime = parseInt(document.getElementById('rentalTime').value, 10);
        const startTime = new Date();
        let endTime = new Date(startTime.getTime() + rentalTime * 60000);
        const sessionName = `جلسة ${sessionNumber}`;
        const existingSession = document.getElementById(`session-${sessionNumber}`);
        
        if (existingSession) {
            alert(`جلسة ${sessionNumber} مشغولة بالفعل.`);
            return;
        }

        const sessionElement = document.createElement('div');
        sessionElement.className = 'session';
        sessionElement.id = `session-${sessionNumber}`;
        sessionElement.innerHTML = `<h2>${sessionName}</h2><div id="countdown-${sessionNumber}"></div>
                                    <div>اسم الزبون: ${customerName}</div>
                                    <div>وقت البدء: ${startTime.toLocaleTimeString()}</div>`;
        notifications.appendChild(sessionElement);

        saveSessionToLocalStorage(sessionNumber, {
            customerName: customerName,
            startTime: startTime,
            endTime: endTime
        });

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = endTime - now;
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            document.getElementById(`countdown-${sessionNumber}`).innerHTML = `الوقت المتبقي: ${minutes} دقيقة و ${seconds} ثانية`;

            if (distance < 0) {
                clearInterval(countdownInterval);
                document.getElementById(`countdown-${sessionNumber}`).innerHTML = "انتهى الوقت!";
                if ('speechSynthesis' in window) {
                    const message = `جلسة ${sessionNumber} انتهى وقتهم`;
                    const utterance = new SpeechSynthesisUtterance(message);
                    speechSynthesis.speak(utterance);
                } else {
                    alert("خاصية النطق غير مدعومة في هذا المتصفح.");
                }
                setTimeout(() => {
                    notifications.removeChild(sessionElement);
                    const recordElement = document.createElement('div');
                    recordElement.className = 'session';
                    recordElement.innerHTML = `<h2>${sessionName}</h2>
                                               <div>الزبون: ${customerName}</div>
                                               <div>وقت البدء: ${startTime.toLocaleTimeString()}</div>
                                               <div>وقت الانتهاء: ${endTime.toLocaleTimeString()}</div>`;
                    sessionRecords.appendChild(recordElement);
                    removeSessionFromLocalStorage(sessionNumber);
                }, 60000); // إزالة العنصر بعد دقيقة واحدة
            }
        }

        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
    });

    matchBookingForm?.addEventListener('submit', function(event) {
        event.preventDefault();
        const matchDate = document.getElementById('matchDate').value;
        const matchSessionNumber = document.getElementById('matchSessionNumber').value;
        const sessionName = `جلسة مباراة ${matchSessionNumber}`;
        const matchElement = document.createElement('div');
        matchElement.className = 'session';
        matchElement.innerHTML = `<h2>${sessionName}</h2><div>تاريخ المباراة: ${matchDate}</div>`;
        matchNotifications.appendChild(matchElement);
        saveMatchToLocalStorage(matchSessionNumber, {
            matchDate: matchDate
        });
    });

    function saveSessionToLocalStorage(sessionNumber, sessionData) {
        const sessions = JSON.parse(localStorage.getItem('sessions')) || {};
        sessions[sessionNumber] = sessionData;
        localStorage.setItem('sessions', JSON.stringify(sessions));
    }

    function removeSessionFromLocalStorage(sessionNumber) {
        const sessions = JSON.parse(localStorage.getItem('sessions')) || {};
        delete sessions[sessionNumber];
        localStorage.setItem('sessions', JSON.stringify(sessions));
    }

    function saveMatchToLocalStorage(sessionNumber, matchData) {
        const matches = JSON.parse(localStorage.getItem('matches')) || {};
        matches[sessionNumber] = matchData;
        localStorage.setItem('matches', JSON.stringify(matches));
    }

    function loadSessionsFromLocalStorage() {
        const sessions = JSON.parse(localStorage.getItem('sessions')) || {};
        for (const sessionNumber in sessions) {
            const sessionData = sessions[sessionNumber];
            const startTime = new Date(sessionData.startTime);
            const endTime = new Date(sessionData.endTime);
            const customerName = sessionData.customerName;
            const sessionName = `جلسة ${sessionNumber}`;
            const sessionElement = document.createElement('div');
            sessionElement.className = 'session';
            sessionElement.id = `session-${sessionNumber}`;
            sessionElement.innerHTML = `<h2>${sessionName}</h2><div id="countdown-${sessionNumber}"></div>
                                        <div>اسم الزبون: ${customerName}</div>
                                        <div>وقت البدء: ${startTime.toLocaleTimeString()}</div>`;
            document.getElementById('notifications').appendChild(sessionElement);
            updateCountdown();
            const countdownInterval = setInterval(updateCountdown, 1000);

            function updateCountdown() {
                const now = new Date().getTime();
                const distance = endTime - now;
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                document.getElementById(`countdown-${sessionNumber}`).innerHTML = `الوقت المتبقي: ${minutes} دقيقة و ${seconds} ثانية`;

                if (distance < 0) {
                    clearInterval(countdownInterval);
                    document.getElementById(`countdown-${sessionNumber}`).innerHTML = "انتهى الوقت!";
                    if ('speechSynthesis' in window) {
                        const message = `جلسة ${sessionNumber} انتهى وقتهم`;
                        const utterance = new SpeechSynthesisUtterance(message);
                        speechSynthesis.speak(utterance);
                    } else {
                        alert("خاصية النطق غير مدعومة في هذا المتصفح.");
                    }
                    setTimeout(() => {
                        document.getElementById('notifications').removeChild(sessionElement);
                        const recordElement = document.createElement('div');
                        recordElement.className = 'session';
                        recordElement.innerHTML = `<h2>${sessionName}</h2>
                                                   <div>الزبون: ${customerName}</div>
                                                   <div>وقت البدء: ${startTime.toLocaleTimeString()}</div>
                                                   <div>وقت الانتهاء: ${endTime.toLocaleTimeString()}</div>`;
                        sessionRecords.appendChild(recordElement);
                        removeSessionFromLocalStorage(sessionNumber);
                    }, 60000); // إزالة العنصر بعد دقيقة واحدة
                }
            }
        }
    }

    function loadMatchesFromLocalStorage() {
        const matches = JSON.parse(localStorage.getItem('matches')) || {};
        for (const sessionNumber in matches) {
            const matchData = matches[sessionNumber];
            const matchDate = matchData.matchDate;
            const sessionName = `جلسة مباراة ${sessionNumber}`;
            const matchElement = document.createElement('div');
            matchElement.className = 'session';
            matchElement.innerHTML = `<h2>${sessionName}</h2><div>تاريخ المباراة: ${matchDate}</div>`;
            document.getElementById('matchNotifications').appendChild(matchElement);
        }
    }

    loadSessionsFromLocalStorage();
    loadMatchesFromLocalStorage();
});
