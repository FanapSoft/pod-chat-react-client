import moment from "moment";
import strings from "../constants/localization";
import {getNow} from "./helpers";

function getMomentDate(date) {
  return moment(new Date(date || getNow()))
}

const date =
  {
    isToday(date) {
      return moment(new Date(date)).isSame(getMomentDate().clone().startOf('day'), 'd');
    },
    isYesterday(date) {
      return moment(new Date(date)).isSame(getMomentDate().clone().subtract(1, 'days').startOf('day'));
    },
    isWithinAWeek(date) {
      return moment(new Date(date)).isAfter(getMomentDate().clone().subtract(7, 'days').startOf('day'));
    },
    isWithinAMonth(date) {
      return moment(new Date(date)).isAfter(getMomentDate().clone().subtract(30, 'days').startOf('day'));
    },
    isTwoWeeksOrMore(date) {
      return getMomentDate(date).isAfter(A_WEEK_OLD);
    },
    format(date, format, locale) {
      if (locale === "en") {
        return getMomentDate(date).format(format);
      } else {
        if (format === "YYYY-MM-DD" || format === "YYYY-MM-DD  HH:mm") {
          const formatedDate = new Date(date).toLocaleDateString('fa-IR');
          const dated = new Date(date);
          if (formatedDate) {
            if (format === "YYYY-MM-DD") {
              return formatedDate.replace(/\//g, "-");
            } else if (format === "YYYY-MM-DD  HH:mm") {
              return `${formatedDate}  ${dated.getHours()}:${dated.getMinutes()}`.replace(/\//g, "-");
            }
          }
          return getMomentDate(date).locale("fa-IR").format(format);
        }
        return getMomentDate(date).locale("fa-IR").format(format);
      }
    },
    prettifySince(date) {
      if (date === undefined || date === null || isNaN(date)) {
        return strings.unknown;
      }
      const prettyDate = getNow() - date;
      const isToday = this.isToday(prettyDate);
      const isYesterday = this.isYesterday(prettyDate);
      const isWithinAWeek = this.isWithinAWeek(prettyDate);
      const isWithinAMonth = this.isWithinAMonth(prettyDate);
      if (isToday) {
        const seconds = Math.floor(date / 1000);
        let interval = Math.floor(seconds / (2 * 60));
        if (interval <= 1) {
          return strings.recently;
        }
        return `${strings.todayHour} ${this.format(prettyDate, "HH:mm")}`
      } else if (isYesterday) {
        return strings.yesterday;
      } else if (isWithinAWeek) {
        return strings.withinAWeek;
      } else if (isWithinAMonth) {
        return strings.isWithinAMonth;
      }
      return strings.longTimeAgo;
    }
  };
export default date;