export interface ILoader {
    isLoading: boolean;
    message: string;
}

export interface IDialogState<T> {
    open: boolean;
    mode: "create" | "edit";
    item: T | null;
}

export interface IDeleteDialogState {
    open: boolean;
    id: string | null;
    label: string;
}

export interface IApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}