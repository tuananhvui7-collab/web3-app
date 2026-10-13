import { createGlobalState } from 'react-hooks-global-state'
import moment from 'moment'

const { setGlobalState, useGlobalState, getGlobalState } =
  createGlobalState({
    createModal: 'scale-0',
    connectedAccount: '',
    contract: null,
    proposals: [],
    isStakeholder: false,
    balance: 0,
    mybalance: 0,
  })

const truncate = (text, startChars, endChars, maxLength) => {
  if (!text) return ''
  if (text.length > maxLength) {
    var start = text.substring(0, startChars)
    var end = text.substring(text.length - endChars, text.length)
    while (start.length + end.length < maxLength) {
      start = start + '.'
    }
    return start + end
  }
  return text
}

const daysRemaining = (days) => {
  if (!days) return '0 days'
  const todaysdate = moment()
  let d = Number((days + '000').slice(0))
  let dateFormatted = moment(d).format('YYYY-MM-DD')
  let momentDate = moment(dateFormatted)
  let diff = momentDate.diff(todaysdate, 'days')
  return diff <= 0 ? '0 days' : diff === 1 ? '1 day' : diff + ' days'
}

export {
  truncate,
  setGlobalState,
  useGlobalState,
  getGlobalState,
  daysRemaining,
}
