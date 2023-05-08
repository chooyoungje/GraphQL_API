import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";

let tweets = [
    {
        id: "1",
        text: "첫번째",
        userId : "2"
    },
    {
        id: "2",
        text: "두번째",
        userId : "1"
    },
]

let users = [
    {
        id: "1",
        firstName: "Choo",
        lastName : "Young Je"
    },
    {
        id: "2",
        firstName: "Elon",
        lastName : "Musk"
    }
]


const typeDefs = gql`
    type User{
        id : ID!
        firstName: String!
        lastName : String!
        fullName : String!
    }
    type Tweet {
        id : ID!
        text : String!
        author : User
    }
    type Query{
        movie(id : String!) : Movie
        allMovies : [Movie!]!
        allUsers : [User!]!
        allTweets : [Tweet!]!
        tweet(id : ID!) : Tweet

    }
    type Mutation {
        postTweet(text:String!, userId : ID!) : Tweet
        deleteTweet(id:ID!) : Boolean!
    }
    type Movie {
        id: Int!
        url: String!
        imdb_code: String!
        title: String!
        title_english: String!
        title_long: String!
        slug: String!
        year: Int!
        rating: Float!
        runtime: Float!
        genres: [String]!
        summary: String
        description_full: String!
        synopsis: String
        yt_trailer_code: String!
        language: String!
        background_image: String!
        background_image_original: String!
        small_cover_image: String!
        medium_cover_image: String!
        large_cover_image: String!
        }
`;

const resolvers = {
    Query: {
        async allMovies() {
            const response = await fetch("https://yts.torrentbay.to/api/v2/list_movies.json");
            const json = await response.json();
            console.log(json);
            return json.data.movies;
        },
        allUsers() { 
            console.log("allUsers 호출");
            return users;
        },
        allTweets() { 
            return tweets;
        },
        tweet(root, {id}) { 
            console.log(id);
            return tweets.find(tweet => tweet.id === id);
        },
        async movie(_, {id}) { 
            const response = await fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`);
            const json = await response.json();
            console.log(json);
            return json.data.movie;
        }
        
    },
    Mutation: {
        postTweet(_, { text, userId }) { 
            // userId가 userDB에 있는 지 체크
            const realUser = users.find(user => user.id === userId);
            if (realUser) { 
                const newTweet = {
                    id: tweets.length + 1,
                    text,
                    userId
                }
                tweets.push(newTweet);
                return newTweet;
            }
            return console.log("없는 유저입니다");
        },
        deleteTweet(_, { id }) { 
            const findTweet = tweets.find(tweet => tweet.id === id);
            if (!findTweet) { 
                return false;
            }
            tweets = tweets.filter(tweet => tweet.id !== id);
            return true;
        }
    },
    User: {
        fullName({firstName, lastName}) {
            return `${firstName} ${lastName}`
        }
    },
    Tweet: {
        author({ userId }) { 
            return users.find((user) => user.id === userId);
        }
    }
}

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
    console.log(`Runnig on ${url}`);
})
