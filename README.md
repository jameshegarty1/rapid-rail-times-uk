# train_times_app


Looking to create a simple webapp using react on the frontend and FastAPI+Mongo backend.

The goal will be to provide train routes to users based on their preferences.

When we use Google Maps, it may recommend less direct routes using buses, avoiding walking. Sometimes, I just want to know what time the national rail trains run between stations I can utilise.

For example, from Vauxhall to Blackheath is a horrific route on Google. But actually you can train to BKH from Victoria, Denmark Hill, Charing X, Waterloo East, London Bridge which are all quite nearby to Vauxhall.


In the app, we will store profiles for each user, where one profile will hold a set of possible destinations, and a set of possible sources (also # of changes, and departure time). Then the app will display the available routes. 


We will use the Darwin API.
