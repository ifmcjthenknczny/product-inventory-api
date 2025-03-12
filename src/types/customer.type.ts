export type Location = 'US' | 'Europe' | 'Asia'

export type Customer = {
    _id: number,
    name: string,
    location: Location
}