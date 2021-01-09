// [*] read bellow
export enum ExchangeType {
    fanout = 'fanout', // route key never matters
    direct = 'direct', // one route key
    header = 'header', // can be multiple route keys, basically works as a pattern (can behave like fanout or direct depending on '*' and '#' special symbols)
    topic = 'topic',
}

// better to take a look at the off tutorials
// [*] https://www.rabbitmq.com/tutorials/tutorial-four-javascript.html
