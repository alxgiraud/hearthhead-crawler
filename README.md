# Hearthhead Crawler
Hearthhead Crawler is a NodeJS script retrieving data of minions from hearthead.com

It has been developped to gather data for the project [Hearthstone Sounds](https://github.com/alxgiraud/hearthstone-sounds/).

### How-To
Type `node server.js` to run the script.

A promt will ask you what action you want to perform. 
Find below the list of available actions:

##### init:

Create or replace the file *data.json* with array of objects.
Each object refer to the ID and the IMAGE_ID of a minion.

Example: `{ id: 123, image: 'ABC' }`


##### refresh:

Retrieved ID of minions from data.json between start and end parameters then add all sounds information from each hearthead's subdomains to them.

##### reset:

Remove all information from the file *data.json*

##### exit:

Stop the server.


-----------------


*The information gathered by this script contains data that is Copyright Blizzard Entertainment® - All Rights Reserved*
