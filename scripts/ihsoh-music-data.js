(function () {
  'use strict';

  // Edit this file to add music to ihsoh.
  // albumArt + sticker shows draggable album art on the page.
  // origin + lat + lng adds a dot to the world map.
  // For collaborations, use mapArtists to add one dot per artist.
  window.IHSOH_MUSIC_DATA = {
    songs: [
      {
        artist: 'Luke Chiang',
        song: 'TYPHOON',
        album: 'TYPHOON',
        albumArt: 'gif/stickers/typhoon.png',
        sticker: { size: 196, x: 1180, y: 72, rotation: 7 }
      },
      {
        artist: 'PRYVT',
        song: 'BACK TO REALITY',
        album: 'BACK TO REALITY',
        albumArt: 'gif/stickers/pryvtbacktoreality.png',
        sticker: { size: 186, x: 380, y: 92, rotation: -6 }
      },
      {
        artist: 'PRYVT',
        song: '&SCENE',
        album: '&SCENE',
        albumArt: 'gif/stickers/pryvtscene.png',
        sticker: { size: 184, x: 580, y: 350, rotation: 6 }
      },
      {
        artist: 'HYUKOH',
        song: '24: How to find true love and happiness',
        album: '24: How to find true love and happiness',
        albumArt: 'gif/stickers/hyukoh24.png',
        origin: 'Seoul, South Korea',
        lat: 37.5665,
        lng: 126.9780,
        pinType: 'top',
        sticker: { size: 188, x: 1460, y: 324, rotation: -7 }
      },
      {
        artist: 'Sik-K & Lil Moshpit',
        song: 'K-FLIP+',
        album: 'K-FLIP+',
        albumArt: 'gif/stickers/lilmoshpitsikkkflip.png',
        pinType: 'top',
        mapArtists: [
          { artist: 'Sik-K', origin: 'Seoul, South Korea', lat: 37.5665, lng: 126.9780 },
          { artist: 'Lil Moshpit', origin: 'Seoul, South Korea', lat: 37.5665, lng: 126.9780 }
        ],
        sticker: { size: 178, x: 920, y: 416, rotation: 5 }
      },
      {
        artist: 'Ado',
        song: 'Kyougen',
        album: 'Kyougen',
        albumArt: 'gif/stickers/adokyougen.png',
        origin: 'Tokyo, Japan',
        lat: 35.6762,
        lng: 139.6503,
        pinType: 'top',
        sticker: { size: 182, x: 1580, y: 132, rotation: -6 }
      }
    ],

    mapPins: [
      {
        artist: 'NewJeans',
        origin: 'Seoul, South Korea',
        lat: 37.5665,
        lng: 126.9780,
        pinType: 'top'
      }
      // Concert example:
      // { artist: 'Artist Name', origin: 'City, Country', lat: 0, lng: 0, pinType: 'concert', note: 'show note' }
    ]
  };
})();
