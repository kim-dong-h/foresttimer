export function languageFromPath(pathname = globalThis.location?.pathname ?? '/') {
  return localeSegment(pathname) === 'us' ? 'en' : 'ko';
}

export function isLocaleRoute(pathname = globalThis.location?.pathname ?? '/') {
  return ['us', 'kr'].includes(localeSegment(pathname));
}

function localeSegment(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const last = segments.at(-1);
  return last === 'index.html' ? segments.at(-2) : last;
}

export function publicAssetPath(filename, pathname = globalThis.location?.pathname ?? '/') {
  return `${isLocaleRoute(pathname) ? '../' : './'}${filename}`;
}

const copy = {
  ko: {
    'sprout-spirit': '새싹 정령', 'mushroom-sprite': '버섯 요정', 'moss-stone-spirit': '이끼 돌 정령',
    spiritCompanion: '나의 숲 정령', spiritScene: '{timeOfDay} 숲속 빈터에 있는 {name}',
    spiritGrowth: '정령 성장', spiritTotal: '함께한 타이머 시간', spiritZeroTime: '0초', spiritBase: '첫 만남', spiritStage: '{stage}차 진화',
    spiritMilestones: '진화 목표 시간', spiritMilestone: '{stage}차 · {hours}시간', spiritNext: '{stage}차 진화까지 {time}', spiritFullyGrown: '모든 진화를 마쳤어요. 앞으로도 함께해요!',
    spiritStorageBlocked: '브라우저 저장이 차단되어 새로고침하면 정령과 성장 기록이 사라질 수 있어요.',
    spiritReset: '정령 초기화', spiritResetTitle: '정령을 초기화할까요?', spiritResetDescription: '누적 시간과 진화 단계, 숲의 식물이 모두 초기화됩니다.\n현재와 다른 정령과 처음부터 시작합니다.', spiritResetConfirm: '초기화하고 새 정령 만나기',
    forestGrowth: '자라나는 숲', forestPlantCount: '식물 {count} / {max}개', forestNextPlant: '30분마다 식물 하나 · 다음 식물까지 {time}\n누적 {hours}시간에 숲이 완성돼요.', forestComplete: '누적 {hours}시간에 숲이 완성됐어요! 타이머 시간은 계속 기록돼요.',
    spiritIdle: '네가 집중하는 시간을 먹고 자라.\n우리, 함께 시작해 볼까?', spiritRunning: '집중하는 만큼 조금씩 자라고 있어.\n네 곁에서 기다릴게!', spiritPaused: '잠깐 쉬어가도 괜찮아.\n준비되면 다시 함께하자.', spiritFinished: '함께한 시간을 잘 먹었어!\n수고했어. 이제 잠깐 쉬어도 좋아.',
    normal: '일반', focus: '집중', modePicker: '모드 선택', quest: '지금 하는 일에 집중하기',
    timeRemaining: 'TIME REMAINING', questComplete: 'QUEST COMPLETE', oneThing: 'ONE THING AT A TIME', wellDone: 'WELL DONE, ADVENTURER!',
    editTime: '현재 {time}. 클릭하여 시간 설정', applyTime: '시간 적용', minute: '분', second: '초',
    start: '시작하기', pause: '일시정지', resume: '이어서 시작', restart: '다시 시작', reset: '초기화',
    ready: '준비됐나요? 오늘의 집중 퀘스트를 시작하세요.', running: '숲의 정령과 함께, 지금에 집중하세요.', paused: '잠깐 쉬어가도 괜찮아요. 모험은 기다려줄게요.', finished: '퀘스트 완료! 수고했어요. 잠시 쉬어가세요.', setTimeFirst: '먼저 집중할 시간을 설정해 주세요.',
    timerSettings: '타이머 시간 설정', remainingTime: '남은 시간 {time}', statusFinished: '완료!', statusPaused: '일시정지', statusRunning: '집중 중', tip: '모든 모험은 작은 한 걸음에서 시작됩니다.', footer: '작은 집중, 작은 모험',
    camp: 'FOREST GROVE', rainOn: '빗소리 재생', rainOff: '빗소리 끄기', rain: '빗소리',
    sceneCup: '{timeOfDay} 모닥불 옆에서 컵을 들고 쉬는 토끼 탐험가', sceneBook: '{timeOfDay} 모닥불 옆에서 책을 읽는 토끼 탐험가', day: '햇살 아래', night: '달빛 아래',
    rabbitIdle: '서두르지 않아도 괜찮아.\n우리, 작은 집중부터 시작할까?', rabbitRunning: '좋아, 한 번에 하나씩!\n지금은 집중할 시간이야.', rabbitPaused: '숨을 고르는 것도 모험의 일부야.\n준비되면 다시 출발하자.', rabbitFinished: '오늘의 작은 모험을 해냈어!\n이제 조금 쉬어도 좋아.', explorer: '작은 숲의 탐험가',
    notification: '완료 알림', notificationTest: '테스트', notificationOn: '켜짐', notificationTurningOn: '준비 중', notificationEnable: '켜기',
    focusQuestPrompt: '빗소리를 들으면서 조금 더 집중 하지 않을래?', continue: '계속할게', resetNow: '초기화할게',
    selectFocusTime: '집중 시간 선택', saved: '저장', basic: '기본', add: '추가', delete: '삭제', addFocusTime: '집중 시간 추가', wantedTime: '원하는 시간 추가', addTime: '추가할 시간', save: '저장', cancel: '취소', maxMinutes: '최대 {minutes}분', savedNotice: '{label} 저장했어요.', storageBlocked: '시간을 추가했지만 브라우저 저장이 차단되어 새로고침하면 사라져요.', deleteNotice: '{label} 삭제했어요.', deleteStorageBlocked: '시간을 삭제했지만 브라우저 저장이 차단되어 새로고침하면 다시 나타날 수 있어요.', presetFull: '기본 30분을 포함해 최대 {count}개의 시간이 저장되어 있어요.',
    presetInvalid: '0~{minutes}분, 0~59초의 정수로 입력해 주세요.', presetRange: '1초~{minutes}분 사이로 입력해 주세요.', presetDuplicate: '이미 저장된 시간이에요.', presetLimit: '시간은 최대 {count}개까지 저장할 수 있어요.', presetDefault: '기본 30분은 삭제할 수 없어요.', presetMissing: '저장된 시간을 찾을 수 없어요.',
    returnHistory: '돌아온 기록', totalCount: '총 {count}회', started: '시작', returnTimes: '돌아온 시각 목록', round: '{count}회', returnedAt: '돌아온 시각', elapsed: '시작 후 경과', noReturns: '아직 돌아온 기록이 없어요.', startToRecord: '타이머를 시작하면 돌아온 시각이 여기에 기록돼요.', longestFocus: '최장 집중 구간', longestHelp: '타이머를 다시 확인하기까지 가장 길게 이어진 시간이에요.', returnHelp: '실행 중 다른 탭·창으로 갔다 돌아올 때 기록해요. 최근 기록은 이 브라우저에 저장돼요.',
    notificationUnsupported: '이 브라우저는 완료 알림을 지원하지 않아요. Chrome 또는 Edge에서 열어 주세요.', notificationInsecure: '완료 알림은 HTTPS 주소 또는 localhost에서 사용할 수 있어요.', notificationDenied: '알림이 차단되어 있어요. 브라우저 사이트 설정에서 알림을 허용해 주세요.', notificationHelp: '다른 탭에 있어도 알려드려요. 타이머 탭은 열어 두세요.', permissionRequired: '알림 권한을 허용하면 완료 알림을 받을 수 있어요.', notificationFailure: '알림을 켜지 못했어요. 다시 시도해 주세요.', notificationSendFailure: '알림을 보내지 못했어요. 브라우저와 기기의 알림 설정을 확인해 주세요.', notificationPrepareFailure: '알림 준비에 실패했어요. 다시 시도해 주세요.', notificationPrepareTimeout: '알림 준비 시간이 초과됐어요. 다시 시도해 주세요.', notificationUnavailable: '이 환경에서는 완료 알림을 사용할 수 없어요.', notificationTestTitle: 'forestTimer · 알림이 준비됐어요', notificationTestBody: '타이머가 끝나면 이렇게 알려드릴게요.', notificationTestSent: '테스트 알림을 보냈어요. 기기 알림을 확인해 주세요.', completionTitle: 'forestTimer · 집중 완료!', completionBody: '잘했어요! 설정한 시간이 끝났어요. 잠시 쉬어가세요.',
  },
  en: {
    'sprout-spirit': 'Sprout Spirit', 'mushroom-sprite': 'Mushroom Fairy', 'moss-stone-spirit': 'Moss Stone Spirit',
    spiritCompanion: 'MY FOREST SPIRIT', spiritScene: '{name} in a forest clearing {timeOfDay}',
    spiritGrowth: 'Spirit growth', spiritTotal: 'Timer time together', spiritZeroTime: '0s', spiritBase: 'First meeting', spiritStage: 'Evolution {stage}',
    spiritMilestones: 'Evolution milestones', spiritMilestone: 'Stage {stage} · {hours}h', spiritNext: '{time} until evolution {stage}', spiritFullyGrown: 'Fully evolved. Let’s keep growing together!',
    spiritStorageBlocked: 'Browser storage is blocked. Your spirit and progress may be lost after refresh.',
    spiritReset: 'Reset spirit', spiritResetTitle: 'Reset your spirit?', spiritResetDescription: 'Your accumulated time, evolution and forest plants will be cleared.\nStart fresh with a different spirit.', spiritResetConfirm: 'Reset and meet a new spirit',
    forestGrowth: 'Growing forest', forestPlantCount: '{count} / {max} plants', forestNextPlant: 'A plant every 30 minutes · Next plant in {time}\nYour forest is complete at {hours} total hours.', forestComplete: 'Forest complete at {hours} total hours! Your timer time is still recorded.',
    spiritIdle: 'I grow by feeding on your focus time.\nShall we begin together?', spiritRunning: 'I’m growing while you focus.\nI’ll be right here with you!', spiritPaused: 'It’s okay to take a break.\nWe can continue when you’re ready.', spiritFinished: 'Thank you for the time we shared!\nGreat work. Enjoy a little rest.',
    normal: 'Normal', focus: 'Focus', modePicker: 'Mode', quest: 'Focus on what you are doing',
    timeRemaining: 'TIME REMAINING', questComplete: 'QUEST COMPLETE', oneThing: 'ONE THING AT A TIME', wellDone: 'WELL DONE, ADVENTURER!',
    editTime: 'Current time {time}. Click to set the timer', applyTime: 'Apply time', minute: 'min', second: 'sec',
    start: 'Start', pause: 'Pause', resume: 'Resume', restart: 'Start again', reset: 'Reset',
    ready: 'Ready? Start your focus quest for today.', running: 'Stay in the moment with your forest spirit.', paused: 'It is okay to pause. The adventure will wait.', finished: 'Quest complete! Great work. Take a break.', setTimeFirst: 'Set a focus time first.',
    timerSettings: 'Set timer duration', remainingTime: '{time} remaining', statusFinished: 'Complete!', statusPaused: 'Paused', statusRunning: 'Focusing', tip: 'Every adventure begins with one small step.', footer: 'Small focus, small adventure',
    camp: 'FOREST GROVE', rainOn: 'Play rain sounds', rainOff: 'Stop rain sounds', rain: 'Rain sounds',
    sceneCup: 'Rabbit explorer relaxing with a cup by the campfire {timeOfDay}', sceneBook: 'Rabbit explorer reading a book by the campfire {timeOfDay}', day: 'in the sunlight', night: 'under moonlight',
    rabbitIdle: 'There is no need to rush.\nShall we start with a small focus session?', rabbitRunning: 'One thing at a time!\nNow is time to focus.', rabbitPaused: 'Taking a breath is part of the adventure.\nStart again when you are ready.', rabbitFinished: 'You completed today’s small adventure!\nYou can take a break now.', explorer: 'Little forest explorer',
    notification: 'Completion alerts', notificationTest: 'Test', notificationOn: 'On', notificationTurningOn: 'Preparing', notificationEnable: 'Enable',
    focusQuestPrompt: 'Would you like to focus a little longer with the rain sounds?', continue: 'Keep going', resetNow: 'Reset timer',
    selectFocusTime: 'Focus time', saved: 'saved', basic: 'default', add: 'Add', delete: 'Delete', addFocusTime: 'Add focus time', wantedTime: 'Add a custom time', addTime: 'Time to add', save: 'Save', cancel: 'Cancel', maxMinutes: 'up to {minutes} min', savedNotice: 'Saved {label}.', storageBlocked: 'The time was added, but browser storage is blocked and it will disappear after refresh.', deleteNotice: 'Deleted {label}.', deleteStorageBlocked: 'The time was deleted, but browser storage is blocked and it may reappear after refresh.', presetFull: 'Up to {count} times, including the default 30 min, are saved.',
    presetInvalid: 'Enter whole numbers from 0–{minutes} minutes and 0–59 seconds.', presetRange: 'Enter a time between 1 second and {minutes} minutes.', presetDuplicate: 'That time is already saved.', presetLimit: 'You can save up to {count} times.', presetDefault: 'The default 30 min time cannot be deleted.', presetMissing: 'Saved time not found.',
    returnHistory: 'Return history', totalCount: '{count} returns', started: 'Started', returnTimes: 'Return times', round: 'Return {count}', returnedAt: 'Returned at', elapsed: 'Elapsed', noReturns: 'No returns recorded yet.', startToRecord: 'Return times will be recorded here after you start the timer.', longestFocus: 'Longest focus interval', longestHelp: 'This is the longest stretch before you returned to the timer.', returnHelp: 'A return is recorded when you come back from another tab, window, or mobile app. Recent history is saved in this browser.',
    notificationUnsupported: 'This browser does not support completion alerts. Open the timer in Chrome or Edge.', notificationInsecure: 'Completion alerts work on HTTPS or localhost.', notificationDenied: 'Alerts are blocked. Allow them in your browser site settings.', notificationHelp: 'You can be notified from another tab. Keep the timer tab open.', permissionRequired: 'Allow notification permission to receive completion alerts.', notificationFailure: 'Could not enable alerts. Please try again.', notificationSendFailure: 'Could not send the alert. Check your browser and device notification settings.', notificationPrepareFailure: 'Could not prepare alerts. Please try again.', notificationPrepareTimeout: 'Alert preparation timed out. Please try again.', notificationUnavailable: 'Completion alerts are not available in this environment.', notificationTestTitle: 'forestTimer · Alerts are ready', notificationTestBody: 'This is how we will let you know when the timer finishes.', notificationTestSent: 'A test alert was sent. Check your device notifications.', completionTitle: 'forestTimer · Focus complete!', completionBody: 'Great work! Your timer has finished. Take a break.',
  },
};

export function t(language, key, values = {}) {
  const template = copy[language]?.[key] ?? copy.ko[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
}

export function formatPreset(totalSeconds, language) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  const units = language === 'en' ? ['h', 'm', 's'] : ['시간', '분', '초'];
  return [[hours, units[0]], [minutes, units[1]], [seconds, units[2]]].filter(([value]) => value).map(([value, unit]) => `${value}${unit}`).join(' ');
}

export function formatElapsed(milliseconds, language) {
  const seconds = Math.floor(milliseconds / 1000);
  return language === 'en'
    ? `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    : `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
}
