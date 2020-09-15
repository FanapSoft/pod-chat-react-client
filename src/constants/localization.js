import LocalizedStrings from "react-localization";

let strings = new LocalizedStrings({
  fa: {
    admin: "مدیر",
    podchat: "تاک",
    search: "جستجو",
    tryAgain: "تلاش دوباره",
    pleaseStartAThreadFirst: "یه نفرو برای چت انتخاب کن!!",
    pleaseWriteHere: "اینجا بنویسید...",
    waitingForChatInstance: "در حالت برقراری ارتباط با سرور چت",
    messageInfo: "اطلاعات پیام",
    add: "اضافه کردن",
    addContact: "اضافه کردن مخاطب",
    editContact: contact => {
      if (!contact) {
        return "اصلاح مخاطب";
      }
      return `اصلاح مخاطب ${contact.firstName || ""} ${contact.lastName || ""}`;
    },
    removeContact: "حذف مخاطب",
    contactList: "لیست مخاطبین",
    cancel: "لغو",
    close: "بستن",
    startChat: "شروع گفتگو",
    edited: "اصلاح شد",
    groupDescription: isChannel => `توضیحات ${isChannel ? "کانال" : "گروه"}`,
    waitingForMessageFetching: "در حالت دریافت پیامهای قبلی",
    creatingChatWith: (firstName, lastName) => {
      return `در حال ایجاد گفتگو با ${firstName} ${lastName}`;
    },
    thereIsNoChat: "گفتگویی وجود ندارد",
    select: "انتخاب",
    forwardTo: "انتخاب گفتگو برای فرستادن",
    forward: "ارسال",
    thereIsNoMessageToShow: "هیچ پیامی برای نمایش وجود ندارد",
    mobilePhone: "شماره موبایل",
    mobilePhoneOrUsername: "شماره موبایل یا یوزرنیم",
    unknown: "نامشخص",
    required: "اجباری",
    firstName: "نام",
    groupName: isChannel => `نام ${isChannel ? "کانال" : "گروه"}`,
    groupNameNotEntered: isChannel => `نام ${isChannel ? "کانال" : "گروه"} وارد نشده است`,
    lastName: "نام خانوادگی",
    replyTo: "پاسخ به",
    reply: "پاسخ",
    isNotPodUser: "کاربر پاد نیست",
    pinToTop: "چسباندن به بالا",
    unpinFromTop: "برداشتن از بالا",
    forwardFrom: "ارسال شده از طرف",
    selectContacts: "انتخاب مخاطبها",
    openThread: "باز کردن گفتگو",
    download: "دانلود",
    createGroup: isChannel => `ایجاد ${isChannel ? "کانال" : "گروه"}`,
    member: "عضو",
    you: "شما",
    addMember: "اضافه کردن عضو",
    saveSettings: "ذخیره تغییرات",
    groupSettings: isChannel => `تنظیمات ${isChannel ? "کانال" : "گروه"}`,
    chatInfo: "اطلاعات گفتگو",
    years: "سال",
    months: "ماه",
    days: "روز",
    hours: "ساعت",
    minutes: "دقیقه",
    seconds: "ثانیه",
    yesterday: "دیروز",
    todayHour: "امروز ساعت",
    withinAWeek: "در همین هفته",
    isWithinAMonth: "در همین ماه",
    longTimeAgo: "خیلی وقت پیش",
    lastSeen(string) {
      if (string === strings.unknown) {
        return string;
      }
      return `آخرین بازدید ${string}`;
    },
    recently: "چند لحظه پیش",
    sentAFile: "فایلی فرستاده شد",
    sentAMessage: "پیغامی فرستاده شد",
    remove: "حذف",
    groupInfo: isChannel => `اطلاعات ${isChannel ? "کانال" : "گروه"}`,
    contactInfo: "اطلاعات مخاطب",
    contacts: "مخاطبین",
    imageText: "متن تصویر",
    send: "بفرست",
    firstOrFamilyNameIsRequired: "نام یا نام خانوادگی اجباری است",
    mobilePhoneIsRequired: "شماره موبایل یا نام کاربری اجباری است",
    youCannotAddYourself: "شما نمیتوانید شماره موبایل خودتان را وارد نمایید",
    copyText: "کپی",
    howDoYouPinThisMessage: "چطور این پیام رو به بالا میچسبونید",
    pinAndNotifyAll: "چسباندن و با خبر سازی همه",
    onlyPin: "فقط بچسبه به بالا",
    batchMessageSentToThread(messagesCount, isGroup, isChannel) {
      if (isChannel || isGroup) {
        return `${messagesCount} پیام در ${isGroup ? "گروه" : "کانال"} ارسال شده`;
      }
      return `${messagesCount} پیام  ارسال شده`
    },
    areYouSureAboutDeletingMessage(messagesCount) {
      if (!messagesCount) {
        return "از حذف این پیغام مطمئنید";
      }
      return `از حذف ${messagesCount} پیام مطمئنید`
    },
    areYouSureAboutDeletingContact(contactName) {
      if (contactName) {
        return `میخواهید "${contactName}" را حذف کنید`;
      }
      return `از حذف این مخاطب مطمئنید`
    },
    typing(name) {
      if (!name) {
        return "در حال نوشتن"
      }
      return `${name} در حال نوشتن `
    },
    areYouSureAboutUnblockingContact(contactName) {
      if (contactName) {
        return `میخواهید "${contactName}" را از لیست سیاه خارج کنید`;
      }
      return `از خارج کردن این مخاطب از لیست سیاه مطمئنید`
    },
    areYouSureAboutLeavingGroup(threadName, isChannel) {
      return `میخواهید ${isChannel ? "کانال" : "گروه"} "${threadName}" را ترک کنید`;
    },
    areYouSureRemovingThread: "از پاک کردن این گفتگو مطمئنید",
    areYouSureAboutRemovingMember(participantName, isChannel) {
      return `میخواهید "${participantName}" از ${isChannel ? "کانال" : "گروه"} حذف کنید`;
    },
    modalMedia: {
      CLOSE: "بستن",
      NEXT: "بعدی",
      PREV: "قبلی",
      ERROR: "نمیتونم باز کنم این فایلو فکر کنم مشکل شبکست",
      PLAY_START: "شروع به نمایش خودکار",
      PLAY_STOP: "توقف نمایش خودکار",
      FULL_SCREEN: "نمایش تمام صفحه",
      THUMBS: "تصاویر کوچک بند انگشتی",
      ZOOM: "بزرگنمایی",
    },
    messagesCount(messagesCount) {
      return `${messagesCount} پیام`
    },
    thereIsNoContactWithThisKeyword(keyword) {
      if (!keyword && !keyword.trim()) {
        return 'مخاطبی با مشخصات وارد شده یافت نشد...'
      }
      return `مخاطبی با مشخصات "${keyword}" وجود ندارد `;
    },
    thereIsNoThreadsWithThisKeyword(keyword) {
      if (!keyword && !keyword.trim()) {
        return 'گفتگویی تحت این عنوان یافت نشد...'
      }
      return `گفتگوی تحت عنوان "${keyword}" وجود ندارد `;
    },
    createdAThread(person, isGroup, isChannel) {
      if (isChannel) {
        return `${person} کانالی ساخت`
      }
      if (isGroup) {
        return `${person} گروهی ساخت`
      }
      return `${person} گفتگویی ساخت`
    },
    noResult: "نتیجه ای وجود ندارد",
    noBodyReadMessage: "کسی این پیام را نخوانده",
    conversations: "گفتگوها",
    searchSomething: "کلمه ای تایپ کنید",
    searchMessages: "جستجو پیامها",
    messageSeenList: "لیست خواننده ها",
    edit: "اصلاح",
    block: "مسدود سازی",
    notification: "اعلانات",
    blocked: "مسدود شده",
    active: "فعال",
    inActive: "غیرفعال",
    reportSpam: "اعلام گفتگو هجو",
    areYouSureToDoIt: "از انجام این کار مطمئنید",
    leaveGroup: isChannel => `ترک ${isChannel ? "کانال" : "گروه"}`,
    chatState: {
      networkDisconnected: "عدم ارتباط",
      reconnecting: "اتصال به شبکه",
      connectingToChat: "در حال اتصال"
    },
    waitingForContact: "در حال دریافت مخاطبین",
    waitingForGettingContactInfo: "دریافت اطلاعات مخاطب",
    noContactPleaseAddFirst: "مخاطبی وجود ندارد کسی را اضافه کنید",
    signedOut: "خروج",
    selectMessage: "پیامی را انتخاب کنید",
    unBlock: "رفع مسدودی",
    accept: "قبول",
    leave: "ترک",
    description: "توضیحات",
    photo: "عکس",
    video: "ویدیو",
    unreaded: "خوانده نشده",
    mute: "قطع اعلانات",
    unmute: "برقراری اعلانات",
    messageDeleted: "پیام پاک شده است",
    forMeOnly: "فقط برای من",
    forMeAndOthers: "برای من و دیگران",
    removeMessageThatYouCanDeleteForAll: "برای من و اونایی که برای دیگران هم میشه",
    adminList: "لیست مدیران",
    admins: "مدیران",
    addAdmin: "اضافه کردن مدیر",
    doAdd: "اضافه کن",
    canceledIDontWant: "ولش کن نمیخواد",
    draft: "پیشنویس",
    personPinnedMessage(isChannel) {
      return `پیامی به بالای ${isChannel ? "کانال" : "گروه"} چسبیده شد`
    },
    areYouSureAboutAddThisPersonToAdminList: "آیا مطمئنید میخوهید این کاربر را به لیست مدیران اضافه کنید",
    howWeShouldDeleteThisMessageForYou: count => {
      if (count) {
        return `این ${count} تا پیام رو چطوری دوست داری برات حذف کنیم`
      }
      return "این پیام رو چطوری دوست داری برات حذف کنیم";
    },
    searchingForContacts: "در حال جستجو مخاطبین",
    searchingForThreads: "در حال جستجو گفتگوها",
    iCanceled: "منصرف شدم",
    unreadMessages: "پیامهای خوانده نشده",
    seenLastMessage: "پیام ها را خواندم",
    removeThread: "حذف گفتگو",
    fileSelected(count) {
      return `${count} فایل برای ارسال داریم نظری در موردشون داری بنویس`
    },
    comment: "نظر",
    emojiCatNames: {
      people: "مردم",
      nature: "طبیعت",
      things: "اشیا",
      cityAndTraffic: "شهر و شلوغی",
      numbersClockAndLang: "اعداد، ساعت و زبان",
    },
    sendFiles(count, isImages) {
      const fileText = isImages ? "عکس" : "فایل";
      if (count <= 1) {
        return `ارسال ${fileText}`;
      }
      return `ارسال ${count} ${fileText}`;
    },
    thereIsNoContact: "مخاطبی وجود ندارد",
    share: "اشتراک گذاری",
    socialNetworks: {
      telegram: "تلگرام",
      whatsapp: "واتساپ",
      twitter: "توییتر",
      skype: "اسکایپ"
    },
    areYouSureABoutSendingThisMessage: "از فرستادن این پیام مطئنید",
    gotoMessage: "رفتن به پیام",
    addToContact: "اضافه کردن به مخطابین",
    messageTypes: {
      people: "اعضا",
      picture: "تصاویر",
      file: "فایلها",
      video: "ویدیوها",
      sound: "صداها",
      voice: "وویس ها"
    }
  },
  it: {}
});
strings.setLanguage("fa");
export default strings;