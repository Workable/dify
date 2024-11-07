import { isPlainObject } from 'lodash-es'
import type { ChatItem } from '../types'
import type { InputForm } from './type'
import { InputVarType } from '@/app/components/workflow/types'
import { getProcessedFiles } from '@/app/components/base/file-uploader/utils'

export const processOpeningStatement = (openingStatement: string, inputs: Record<string, any>, inputsForm: InputForm[]) => {
  if (!openingStatement)
    return openingStatement

  return openingStatement.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const name = inputs[key]
    if (name) { // has set value
      return name
    }

    const valueObj = inputsForm.find(v => v.variable === key)
    return valueObj ? `{{${valueObj.label}}}` : match
  })
}

export const getProcessedInputs = (inputs: Record<string, any>, inputsForm: InputForm[]) => {
  const processedInputs = { ...inputs }

  inputsForm.forEach((item) => {
    if (item.type === InputVarType.multiFiles && inputs[item.variable])
      processedInputs[item.variable] = getProcessedFiles(inputs[item.variable])

    if (item.type === InputVarType.singleFile && inputs[item.variable])
      processedInputs[item.variable] = getProcessedFiles([inputs[item.variable]])[0]
  })

  return processedInputs
}

const stringToObject = (str: string): Record<string, unknown> | null => {
  try {
    const maybeObject = JSON.parse(str)
    if (!isPlainObject(maybeObject))
      return null
    const obj: Record<string, unknown> = maybeObject
    return obj
  }
  catch {
    return null
  }
}

const TICKET_CREATION_KEYS = ['fullname', 'email', 'question'] as const
const isZendeskTicketCreationFormDataQuestion = (item: ChatItem): boolean => {
  if (item.isAnswer)
    return false
  const obj = stringToObject(item.content)
  return !!obj && TICKET_CREATION_KEYS.every(key => key in obj)
}

const LINK_REQUISITION_TO_JOB_KEYS = ['fullname', 'email', 'job_url', 'req_id'] as const
const isLinkRequisitionToJobFormDataQuestion = (item: ChatItem): boolean => {
  if (item.isAnswer)
    return false
  const obj = stringToObject(item.content)
  return !!obj && LINK_REQUISITION_TO_JOB_KEYS.every(key => key in obj)
}

export const shouldHideItem = (item: ChatItem): boolean => {
  const predicates = [isZendeskTicketCreationFormDataQuestion, isLinkRequisitionToJobFormDataQuestion]
  return predicates.some(predicate => predicate(item))
}
