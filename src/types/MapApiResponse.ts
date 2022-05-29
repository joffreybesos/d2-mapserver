export interface MapApiResponse {
    crop:     Crop;
    exits:    { [key: string]: Exit };
    id:       number;
    mapData:  number[];
    npcs:     { [key: string]: Offset[] };
    objects:  { [key: string]: Offset[] };
    offset:   Offset;
    pathData: any[];
    size:     Size;
}

export interface Crop {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

export interface Exit {
    isPortal: boolean;
    offsets:  Offset[];
}

export interface Offset {
    x: number;
    y: number;
}

export interface Size {
    height: number;
    width:  number;
}
