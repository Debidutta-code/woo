export interface ICExplorDestination {
    destinationName: string;
    destinationImage: string;
    slNo: number;
}

export interface IExplorDestination extends ICExplorDestination {
    id: string;
}
