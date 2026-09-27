WITH icons (
  id, slug, title, page, image, alt, caption,
  x, y, size, rotation, spawn_bias, sort_order
) AS (
  VALUES
    (
      'floating-about-snoopy', 'about-snoopy', 'snoopy', 'about',
      'https://upload.wikimedia.org/wikipedia/en/5/53/Snoopy_Peanuts.png',
      'Snoopy sticker', 'snoopy: my spirit mascot',
      18, 18, 148, -8, '', 0
    ),
    (
      'floating-about-piplup', 'about-piplup', 'piplup', 'about',
      'gif/stickers/piplup1.webp',
      'Piplup sticker', 'piplup: the best starter, no doubt',
      248, 214, 112, 6, '', 1
    ),
    (
      'floating-about-smiski', 'about-smiski', 'smiski', 'about',
      'gif/stickers/smiski1.png',
      'Smiski sticker', 'smiskis: i''ve collected far too many of these',
      1092, 24, 332, -6, 'left-bottom', 2
    ),
    (
      'floating-about-camera', 'about-camera', 'fuji xt4', 'about',
      'gif/stickers/xt4.png',
      'XT4 sticker', 'fuji xt4: i bring it everywhere',
      820, 304, 196, 5, '', 3
    ),
    (
      'floating-about-shaymin', 'about-shaymin', 'shaymin card', 'about',
      'gif/stickers/1600.jpg',
      'Photo sticker', 'pkmn cards: shaymin no. 1',
      96, 606, 126, -7, '', 4
    ),
    (
      'floating-about-typhoon', 'about-typhoon', 'typhoon', 'about',
      'gif/stickers/typhoon.png',
      'Typhoon sticker', 'luke chiang: my fav artist atm',
      700, 438, 206, 7, '', 5
    ),
    (
      'floating-about-rotring', 'about-rotring', 'rotring 600', 'about',
      'gif/stickers/rotring.png',
      'Rotring sticker', 'mech pencil: i really want a rotring 600...',
      1460, 42, 138, -7, 'left-top', 6
    ),
    (
      'floating-about-pepero', 'about-pepero', 'pepero', 'about',
      'gif/stickers/pepero.png',
      'Pepero sticker', 'pepero: i eat these way too often lol',
      1584, 250, 118, 6, '', 7
    ),
    (
      'floating-about-crt-tv', 'about-crt-tv', 'crt tv', 'about',
      'gif/stickers/crttv.png',
      'CRT TV sticker', 'crt tv: i have one hooked up to my pc',
      1740, 26, 156, -6, 'right-top', 8
    ),
    (
      'floating-about-n3ds', 'about-n3ds', 'n3ds', 'about',
      'gif/stickers/n3ds.png',
      'N3DS sticker', 'n3ds: my entire childhood',
      1460, 560, 130, 7, '', 9
    ),
    (
      'floating-about-hockey', 'about-hockey', 'hockey stick', 'about',
      'gif/stickers/stick.png',
      'Stick sticker', 'hockey: avs fan in vancouver lol, 2026 champs soon',
      322, 520, 320, -5, '', 10
    ),
    (
      'floating-about-disc', 'about-disc', 'ultimate disc', 'about',
      'gif/stickers/disc.png',
      'Disc sticker', 'ultimate frisbee: i carry a disc w/ me quite often',
      1040, 614, 134, 6, 'right-bottom', 11
    ),
    (
      'floating-about-yakult', 'about-yakult', 'yakult', 'about',
      'gif/stickers/yakult.png',
      'Yakult sticker', 'yakult: this is my substitute to soju (i don''t drink)',
      1714, 430, 128, -6, '', 12
    ),
    (
      'floating-ihsoh-typhoon', 'ihsoh-typhoon', 'TYPHOON', 'ihsoh',
      'https://i.scdn.co/image/ab67616d0000b27316b953cc2756638d5b6682fc',
      'Luke Chiang - TYPHOON', 'Luke Chiang - TYPHOON',
      1180, 72, 196, 7, '', 13
    ),
    (
      'floating-ihsoh-back-to-reality', 'ihsoh-back-to-reality', 'BACK TO REALITY', 'ihsoh',
      'https://i.scdn.co/image/ab67616d0000b2730cf774b4dce7036b18cab3ee',
      'PRYVT - BACK TO REALITY', 'PRYVT - BACK TO REALITY',
      380, 92, 186, -6, '', 14
    ),
    (
      'floating-ihsoh-scene', 'ihsoh-scene', '&SCENE', 'ihsoh',
      'https://i.scdn.co/image/ab67616d0000b2734240232d28b16aaaf96b41e2',
      'PRYVT - &SCENE', 'PRYVT - &SCENE',
      580, 350, 184, 6, '', 15
    ),
    (
      'floating-ihsoh-hyukoh-24', 'ihsoh-hyukoh-24', '24: How to find true love and happiness', 'ihsoh',
      'https://i.scdn.co/image/ab67616d0000b273a97f3ecf6ac03bb13b218e8c',
      'HYUKOH - 24: How to find true love and happiness',
      'HYUKOH - 24: How to find true love and happiness',
      1460, 324, 188, -7, '', 16
    ),
    (
      'floating-ihsoh-k-flip', 'ihsoh-k-flip', 'K-FLIP+', 'ihsoh',
      'https://i.scdn.co/image/ab67616d0000b27373353f72d6760d107a955847',
      'Sik-K & Lil Moshpit - K-FLIP+', 'Sik-K & Lil Moshpit - K-FLIP+',
      920, 416, 178, 5, '', 17
    ),
    (
      'floating-ihsoh-kyougen', 'ihsoh-kyougen', 'Kyougen', 'ihsoh',
      'https://i.scdn.co/image/ab67616d0000b27364381fb5ba549f149ae74560',
      'Ado - Kyougen', 'Ado - Kyougen',
      1580, 132, 182, -6, '', 18
    )
)
INSERT INTO content_items (
  id, collection, slug, data_json, sort_order, published, created_at, updated_at
)
SELECT
  id,
  'floating-icons',
  slug,
  json_object(
    'title', title,
    'page', page,
    'image', image,
    'alt', alt,
    'caption', caption,
    'x', x,
    'y', y,
    'size', size,
    'rotation', rotation,
    'spawnBias', spawn_bias
  ),
  sort_order,
  1,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
FROM icons
WHERE 1
ON CONFLICT(collection, slug) DO UPDATE SET
  data_json = excluded.data_json,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = excluded.updated_at;
