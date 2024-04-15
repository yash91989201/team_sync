/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	EmployeeDocumentFile = "employee_document_file",
	UserProfile = "user_profile",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type EmployeeDocumentFileRecord = {
	file: string
	file_size: number
	file_type: string
}

export type UserProfileRecord = {
	file_size: number
	file_type: string
	image: string
}

// Response types include system fields and match responses from the PocketBase API
export type EmployeeDocumentFileResponse<Texpand = unknown> = Required<EmployeeDocumentFileRecord> & BaseSystemFields<Texpand>
export type UserProfileResponse<Texpand = unknown> = Required<UserProfileRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	employee_document_file: EmployeeDocumentFileRecord
	user_profile: UserProfileRecord
}

export type CollectionResponses = {
	employee_document_file: EmployeeDocumentFileResponse
	user_profile: UserProfileResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'employee_document_file'): RecordService<EmployeeDocumentFileResponse>
	collection(idOrName: 'user_profile'): RecordService<UserProfileResponse>
}
