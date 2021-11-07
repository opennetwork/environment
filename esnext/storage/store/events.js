export const StoreEventNamespace = "@opennetwork/environment/storage/store";
export const CreatingEventType = "@opennetwork/environment/storage/store/creating";
export const CreatedEventType = "@opennetwork/environment/storage/store/created";
export const UpdatingEventType = "@opennetwork/environment/storage/store/updating";
export const UpdatedEventType = "@opennetwork/environment/storage/store/updated";
export const DeletingEventType = "@opennetwork/environment/storage/store/deleting";
export const DeletedEventType = "@opennetwork/environment/storage/store/deleted";
export const StoreEvents = [
    CreatingEventType,
    CreatedEventType,
    UpdatingEventType,
    UpdatedEventType,
    DeletingEventType,
    DeletedEventType
];
export function isStoreEvent(value) {
    const events = StoreEvents;
    return events.includes(value.type);
}
