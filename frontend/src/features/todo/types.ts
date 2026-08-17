// Todo feature types. The Todo shape is owned by the generated Go bindings
// (the backend generates ids and is the source of truth); this feature just
// re-exports it so consumers import from the feature, not the bindings.
export type { Todo } from '../../../bindings/aka-nasu/backend/config/models.js'
