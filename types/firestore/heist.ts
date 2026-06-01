import { DocumentData, FieldValue, QueryDocumentSnapshot } from 'firebase/firestore'

export type HeistFinalStatus = 'success' | 'failure'

export interface Heist {
  id: string
  title: string
  description: string
  createdBy: string
  createdByCodeName: string
  assignedTo: string
  assignedToCodeName: string
  deadline: Date
  finalStatus: HeistFinalStatus | null
  createdAt: Date
}

export interface CreateHeistInput {
  title: string
  description: string
  createdBy: string
  createdByCodeName: string
  assignedTo: string
  assignedToCodeName: string
  deadline: Date
  finalStatus: null
  createdAt: FieldValue
}

export interface UpdateHeistInput {
  title?: string
  description?: string
  assignedTo?: string
  assignedToCodeName?: string
  deadline?: Date
  finalStatus?: HeistFinalStatus | null
}

export const heistConverter = {
  toFirestore: (data: Partial<Heist>): DocumentData => data,

  fromFirestore: (snapshot: QueryDocumentSnapshot): Heist => ({
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate(),
    deadline: snapshot.data().deadline?.toDate(),
  } as Heist),
}
