/**
 * CC Hub — Product list page
 * Catalog markup lives in product-list.html; this file only filters, sorts, and handles UI.
 */

(() => {
  "use strict";

  const CATEGORY_LABELS = {
    electronics: "Electronics",
    appliances: "TVs & Appliances",
    men: "Men",
    women: "Women",
    kids: "Baby & Kids",
    home: "Home & Furniture",
    sports: "Sports, Books & More",
    farm: "Farm & Garden",
    food: "Food Items",
  };

  const SORT_LABELS = {
    relevance: "Relevance",
    popularity: "Popularity",
    "price-asc": "Price — Low to High",
    "price-desc": "Price — High to Low",
    rating: "Customer Rating",
    newest: "Newest",
  };

  const ITEM_FILTER_MAP = {
    "power banks": "powerBanks",
    cases: "mobileCases",
    "mobile cases": "mobileCases",
    headphones: "headphones",
    "headphones and headsets": "headphones",
    "smart watches": "smartWatches",
    "smart bands": "smartWatches",
    "smart glasses": "smartWatches",
    "gaming laptops": "laptops",
    "thin & light": "laptops",
    "2-in-1 laptops": "laptops",
    laptops: "laptops",
  };

  const GROUP_FILTER_MAP = {
    mobiles: "mobiles",
    "mobile accessories": "mobileCases",
    "smart wearable tech": "smartWatches",
    "health care appliances": "default",
    laptops: "laptops",
    "desktop pcs": "default",
  };

  const params = new URLSearchParams(window.location.search);
  const state = {
    cat: params.get("cat") || "electronics",
    group: params.get("group") || "",
    item: params.get("item") || "",
    sort: "popularity",
    wishlist: new Set(JSON.parse(sessionStorage.getItem("plWishlist") || "[]")),
    cartCount: Number(sessionStorage.getItem("plCartCount") || "0"),
  };

  const els = {
    breadcrumb: document.getElementById("plBreadcrumb"),
    subcatGallery: document.getElementById("plSubcatGallery"),
    title: document.getElementById("plTitle"),
    count: document.getElementById("plCount"),
    filters: document.getElementById("plFilters"),
    applied: document.getElementById("plApplied"),
    sortTabs: document.getElementById("plSortTabs"),
    grid: document.getElementById("plGrid"),
    empty: document.getElementById("plEmpty"),
    sidebar: document.getElementById("plSidebar"),
    backdrop: document.getElementById("plSidebarBackdrop"),
    fab: document.getElementById("plFiltersFab"),
    closeSidebar: document.getElementById("plSidebarClose"),
    clearAll: document.getElementById("plClearAll"),
  };

  const SUBCAT_MQ = window.matchMedia("(max-width: 1198px)");

  const CARD_BG = [
    "#e8eef5",
    "#eef2f6",
    "#eaf4fb",
    "#eef6fb",
    "#e8f0ea",
    "#eef0f4",
    "#eaf3e6",
    "#fbf6e4",
  ];

  const img = (photoId) =>
    `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=200&q=80`;

  /* Themed mock image sets keyed by normalized subcategory name */
  const SUBCAT_IMAGES = {
    /* Electronics */
    apple: ["photo-1511707171634-5f897ff02aa9", "photo-1592750475338-74b7b21085ab", "photo-1510557880182-3d4d3cba35a5", "photo-1580910051074-3eb694886505"],
    samsung: ["photo-1610945415295-d9bbf067e59c", "photo-1598327105666-5b89351aff97", "photo-1511707171634-5f897ff02aa9", "photo-1592899677977-9c10ca588bbd"],
    vivo: ["photo-1592899677977-9c10ca588bbd", "photo-1511707171634-5f897ff02aa9", "photo-1580910051074-3eb694886505", "photo-1592750475338-74b7b21085ab"],
    oppo: ["photo-1598327105666-5b89351aff97", "photo-1510557880182-3d4d3cba35a5", "photo-1610945415295-d9bbf067e59c", "photo-1511707171634-5f897ff02aa9"],
    realme: ["photo-1580910051074-3eb694886505", "photo-1592899677977-9c10ca588bbd", "photo-1592750475338-74b7b21085ab", "photo-1510557880182-3d4d3cba35a5"],
    xiaomi: ["photo-1510557880182-3d4d3cba35a5", "photo-1610945415295-d9bbf067e59c", "photo-1598327105666-5b89351aff97", "photo-1580910051074-3eb694886505"],
    motorola: ["photo-1592750475338-74b7b21085ab", "photo-1511707171634-5f897ff02aa9", "photo-1592899677977-9c10ca588bbd", "photo-1610945415295-d9bbf067e59c"],
    oneplus: ["photo-1598327105666-5b89351aff97", "photo-1580910051074-3eb694886505", "photo-1510557880182-3d4d3cba35a5", "photo-1511707171634-5f897ff02aa9"],
    nothing: ["photo-1511707171634-5f897ff02aa9", "photo-1592899677977-9c10ca588bbd", "photo-1592750475338-74b7b21085ab", "photo-1598327105666-5b89351aff97"],
    iqoo: ["photo-1610945415295-d9bbf067e59c", "photo-1510557880182-3d4d3cba35a5", "photo-1580910051074-3eb694886505", "photo-1592899677977-9c10ca588bbd"],
    next: ["photo-1592750475338-74b7b21085ab", "photo-1511707171634-5f897ff02aa9", "photo-1610945415295-d9bbf067e59c", "photo-1510557880182-3d4d3cba35a5"],
    "smart watches": ["photo-1579586337278-3befd40fd17a", "photo-1434494878577-86c23bcb06b9", "photo-1508685096489-7aacd43bd3b1", "photo-1523275335684-37898b6baf30"],
    "smart bands": ["photo-1434494878577-86c23bcb06b9", "photo-1579586337278-3befd40fd17a", "photo-1508685096489-7aacd43bd3b1", "photo-1510017803434-a899398421b3"],
    "smart glasses": ["photo-1572635196237-14b3f281503f", "photo-1473496169904-658ba7c44d8a", "photo-1574258495973-f010dfbb5147", "photo-1511499767150-a48a237f0083"],
    cases: ["photo-1601784551446-20c9e07cdbdb", "photo-1565849904461-04a58ad377e0", "photo-1556656793-08538906a9f8", "photo-1605236453806-6ff36851218e"],
    chargers: ["photo-1583863788434-e58a36338f18", "photo-1591290619762-c8097c9f4e2e", "photo-1609091839311-d5365f9ff1c5", "photo-1625948515291-69613efd103f"],
    "power banks": ["photo-1609091839311-d5365f9ff1c5", "photo-1625948515291-69613efd103f", "photo-1591290619762-c8097c9f4e2e", "photo-1583863788434-e58a36338f18"],
    "screen guards": ["photo-1556656793-08538906a9f8", "photo-1601784551446-20c9e07cdbdb", "photo-1511707171634-5f897ff02aa9", "photo-1565849904461-04a58ad377e0"],
    cables: ["photo-1625948515291-69613efd103f", "photo-1583863788434-e58a36338f18", "photo-1609091839311-d5365f9ff1c5", "photo-1591290619762-c8097c9f4e2e"],
    holders: ["photo-1605236453806-6ff36851218e", "photo-1556656793-08538906a9f8", "photo-1601784551446-20c9e07cdbdb", "photo-1565849904461-04a58ad377e0"],
    "gaming laptops": ["photo-1603302576837-37561b2e2302", "photo-1496181133206-80ce9b88a853", "photo-1525547719571-a2d4ac882e75", "photo-1588872657578-7efd1f1555cd"],
    "thin & light": ["photo-1496181133206-80ce9b88a853", "photo-1525547719571-a2d4ac882e75", "photo-1517336714731-489689fd1ca8", "photo-1588872657578-7efd1f1555cd"],
    "2-in-1 laptops": ["photo-1525547719571-a2d4ac882e75", "photo-1496181133206-80ce9b88a853", "photo-1603302576837-37561b2e2302", "photo-1517336714731-489689fd1ca8"],
    "all-in-ones": ["photo-1527443224154-c4a3942d3acf", "photo-1587831990711-23ca6441447b", "photo-1593640408182-31c70c8268f5", "photo-1597872200969-2b65d56bd16b"],
    "mini pcs": ["photo-1597872200969-2b65d56bd16b", "photo-1527443224154-c4a3942d3acf", "photo-1587831990711-23ca6441447b", "photo-1593640408182-31c70c8268f5"],
    monitors: ["photo-1527443224154-c4a3942d3acf", "photo-1593640408182-31c70c8268f5", "photo-1587831990711-23ca6441447b", "photo-1498050108023-c5249f4df085"],
    printers: ["photo-1612815154858-60aa4c59eaa6", "photo-1563986768609-322da13575f3", "photo-1587829741301-dc798b83add3", "photo-1541807084-5c52b6b3adef"],
    scanners: ["photo-1563986768609-322da13575f3", "photo-1612815154858-60aa4c59eaa6", "photo-1587829741301-dc798b83add3", "photo-1516321318423-f06f85e504b3"],
    webcams: ["photo-1587829741301-dc798b83add3", "photo-1612815154858-60aa4c59eaa6", "photo-1593640408182-31c70c8268f5", "photo-1484704849700-f032a568e944"],
    "apple ipads": ["photo-1544244015-0df4b3ffc6b0", "photo-1561154464-82e9adf32764", "photo-1585790050230-80dd2865511b", "photo-1555041469-a586c61ea9bc"],
    "android tablets": ["photo-1561154464-82e9adf32764", "photo-1544244015-0df4b3ffc6b0", "photo-1585790050230-80dd2865511b", "photo-1611532736597-de2d4265fba3"],
    "kids tablets": ["photo-1585790050230-80dd2865511b", "photo-1561154464-82e9adf32764", "photo-1503454537195-1dcabb73ffb9", "photo-1544244015-0df4b3ffc6b0"],
    "smart tvs": ["photo-1593359677879-a4bb92f829d1", "photo-1461151304267-38535e780cf4", "photo-1593784991095-a205069470b6", "photo-1571415060716-baff5f980c0d"],
    "4k ultra hd": ["photo-1461151304267-38535e780cf4", "photo-1593359677879-a4bb92f829d1", "photo-1593784991095-a205069470b6", "photo-1571415060716-baff5f980c0d"],
    "oled tvs": ["photo-1593784991095-a205069470b6", "photo-1571415060716-baff5f980c0d", "photo-1593359677879-a4bb92f829d1", "photo-1461151304267-38535e780cf4"],
    "bluetooth speakers": ["photo-1608043152269-423dbba4e7e1", "photo-1545454675-3531b543be5d", "photo-1493225457124-a3eb161ffa5f", "photo-1484704849700-f032a568e944"],
    "dslr & mirrorless": ["photo-1516035069371-29a1b244cc32", "photo-1502920917128-1aa500764cbd", "photo-1606983340126-99ab4feaa64a", "photo-1452780212940-6f5c0d14d848"],
    "action cameras": ["photo-1551698618-1dfe5d97d256", "photo-1502920917128-1aa500764cbd", "photo-1516035069371-29a1b244cc32", "photo-1606983340126-99ab4feaa64a"],
    "instant cameras": ["photo-1526170375885-4d8ecf77b99f", "photo-1452780212940-6f5c0d14d848", "photo-1516035069371-29a1b244cc32", "photo-1502920917128-1aa500764cbd"],
    lenses: ["photo-1606983340126-99ab4feaa64a", "photo-1516035069371-29a1b244cc32", "photo-1502920917128-1aa500764cbd", "photo-1452780212940-6f5c0d14d848"],
    tripods: ["photo-1478720568477-152d9b164e26", "photo-1516035069371-29a1b244cc32", "photo-1606983340126-99ab4feaa64a", "photo-1502920917128-1aa500764cbd"],
    "memory cards": ["photo-1597872200969-2b65d56bd16b", "photo-1555617981-dac3880eac6e", "photo-1527443224154-c4a3942d3acf", "photo-1587831990711-23ca6441447b"],
    routers: ["photo-1544197150-b99a580bb7a2", "photo-1558618666-fcd25c85cd64", "photo-1551703599-6b3e8379aa8b", "photo-1597872200969-2b65d56bd16b"],
    "range extenders": ["photo-1544197150-b99a580bb7a2", "photo-1558618666-fcd25c85cd64", "photo-1551703599-6b3e8379aa8b", "photo-1597872200969-2b65d56bd16b"],
    "mesh wifi": ["photo-1558618666-fcd25c85cd64", "photo-1544197150-b99a580bb7a2", "photo-1551703599-6b3e8379aa8b", "photo-1527443224154-c4a3942d3acf"],

    /* Appliances */
    "smart & ultra hd": ["photo-1593359677879-a4bb92f829d1", "photo-1461151304267-38535e780cf4", "photo-1593784991095-a205069470b6", "photo-1571415060716-baff5f980c0d"],
    "32 inch & below": ["photo-1461151304267-38535e780cf4", "photo-1593359677879-a4bb92f829d1", "photo-1571415060716-baff5f980c0d", "photo-1593784991095-a205069470b6"],
    "43–55 inch": ["photo-1593784991095-a205069470b6", "photo-1571415060716-baff5f980c0d", "photo-1461151304267-38535e780cf4", "photo-1593359677879-a4bb92f829d1"],
    "65 & above": ["photo-1571415060716-baff5f980c0d", "photo-1593784991095-a205069470b6", "photo-1593359677879-a4bb92f829d1", "photo-1461151304267-38535e780cf4"],
    "front load": ["photo-1626806787461-74f1c9c3e4e5", "photo-1558618666-fcd25c85cd64", "photo-1581578731548-c64695cc6952", "photo-1604335399340-0b706c533b37"],
    "top load": ["photo-1581578731548-c64695cc6952", "photo-1626806787461-74f1c9c3e4e5", "photo-1604335399340-0b706c533b37", "photo-1558618666-fcd25c85cd64"],
    "semi automatic": ["photo-1604335399340-0b706c533b37", "photo-1581578731548-c64695cc6952", "photo-1626806787461-74f1c9c3e4e5", "photo-1558618666-fcd25c85cd64"],
    "single door": ["photo-1571175443880-49e1d25b2bc5", "photo-1585659722983-3a675dabf23d", "photo-1574269909862-7e1d70bb8078", "photo-1556911220-bff31c812dba"],
    "double door": ["photo-1574269909862-7e1d70bb8078", "photo-1571175443880-49e1d25b2bc5", "photo-1556911220-bff31c812dba", "photo-1585659722983-3a675dabf23d"],
    "side by side": ["photo-1585659722983-3a675dabf23d", "photo-1574269909862-7e1d70bb8078", "photo-1571175443880-49e1d25b2bc5", "photo-1556911220-bff31c812dba"],
    "french door": ["photo-1556911220-bff31c812dba", "photo-1585659722983-3a675dabf23d", "photo-1571175443880-49e1d25b2bc5", "photo-1574269909862-7e1d70bb8078"],
    irons: ["photo-1556910103-1c02745aae4d", "photo-1581578731548-c64695cc6952", "photo-1558618666-fcd25c85cd64", "photo-1604335399340-0b706c533b37"],
    fans: ["photo-1556911220-e15b29e8c240", "photo-1558618666-fcd25c85cd64", "photo-1581578731548-c64695cc6952", "photo-1604335399340-0b706c533b37"],
    geysers: ["photo-1584622650111-993a426fbf0a", "photo-1556911220-bff31c812dba", "photo-1581578731548-c64695cc6952", "photo-1558618666-fcd25c85cd64"],
    "water purifiers": ["photo-1548839140-29a749e1cf4d", "photo-1523362628745-0c10058bba0c", "photo-1556911220-bff31c812dba", "photo-1584622650111-993a426fbf0a"],
    lg: ["photo-1571175443880-49e1d25b2bc5", "photo-1593359677879-a4bb92f829d1", "photo-1626806787461-74f1c9c3e4e5", "photo-1574269909862-7e1d70bb8078"],
    sony: ["photo-1593359677879-a4bb92f829d1", "photo-1461151304267-38535e780cf4", "photo-1545454675-3531b543be5d", "photo-1516035069371-29a1b244cc32"],
    mi: ["photo-1593359677879-a4bb92f829d1", "photo-1511707171634-5f897ff02aa9", "photo-1579586337278-3befd40fd17a", "photo-1461151304267-38535e780cf4"],
    tcl: ["photo-1461151304267-38535e780cf4", "photo-1593784991095-a205069470b6", "photo-1571415060716-baff5f980c0d", "photo-1593359677879-a4bb92f829d1"],
    "inverter ac": ["photo-1581578731548-c64695cc6952", "photo-1558618666-fcd25c85cd64", "photo-1604335399340-0b706c533b37", "photo-1556911220-e15b29e8c240"],
    "split acs": ["photo-1581578731548-c64695cc6952", "photo-1558618666-fcd25c85cd64", "photo-1604335399340-0b706c533b37", "photo-1556911220-e15b29e8c240"],
    "window acs": ["photo-1558618666-fcd25c85cd64", "photo-1581578731548-c64695cc6952", "photo-1556911220-e15b29e8c240", "photo-1604335399340-0b706c533b37"],
    microwave: ["photo-1574269909862-7e1d70bb8078", "photo-1556910103-1c02745aae4d", "photo-1556911220-bff31c812dba", "photo-1585659722983-3a675dabf23d"],
    chimney: ["photo-1556911220-bff31c812dba", "photo-1556910103-1c02745aae4d", "photo-1574269909862-7e1d70bb8078", "photo-1585659722983-3a675dabf23d"],
    "mixer grinder": ["photo-1556910103-1c02745aae4d", "photo-1556911220-bff31c812dba", "photo-1574269909862-7e1d70bb8078", "photo-1542838132-92c53300491e"],
    otg: ["photo-1556911220-bff31c812dba", "photo-1574269909862-7e1d70bb8078", "photo-1556910103-1c02745aae4d", "photo-1585659722983-3a675dabf23d"],

    /* Men */
    "sports shoes": ["photo-1542291026-7eec264c27ff", "photo-1606107557195-0e29a4b5b4aa", "photo-1600185365483-26d7a4cc7519", "photo-1595950653106-6c9ebd614d3a"],
    "casual shoes": ["photo-1525966223011-a87e74561f32", "photo-1549298916-b41d501d3772", "photo-1460353581641-37baddab0fa2", "photo-1600185365483-26d7a4cc7519"],
    "formal shoes": ["photo-1614252369475-531eba835eb1", "photo-1533867617858-e7b97e060509", "photo-1449505278894-297fdb3edbc1", "photo-1549298916-b41d501d3772"],
    sandals: ["photo-1603487742131-4160ec999306", "photo-1560769629-975ec94e6a86", "photo-1606107557195-0e29a4b5b4aa", "photo-1549298916-b41d501d3772"],
    sneakers: ["photo-1606107557195-0e29a4b5b4aa", "photo-1542291026-7eec264c27ff", "photo-1595950653106-6c9ebd614d3a", "photo-1525966223011-a87e74561f32"],
    "t-shirts": ["photo-1521572163474-6864f9cf17ab", "photo-1583743814966-8936f5b7be1a", "photo-1618354691373-d851c5c3a990", "photo-1562157873-818bc0726f68"],
    "casual shirts": ["photo-1596755094514-f87e34085b81", "photo-1602810318383-e386cc2a3ccf", "photo-1594938298603-c8148c4dae35", "photo-1617137968427-85924c800a22"],
    "formal shirts": ["photo-1598033129183-c4f50c736f10", "photo-1602810318383-e386cc2a3ccf", "photo-1596755094514-f87e34085b81", "photo-1617137968427-85924c800a22"],
    jackets: ["photo-1551028719-00167b16eac5", "photo-1591047139829-d91aecb6caea", "photo-1544022613-e87ca75a784a", "photo-1489987707025-941f354c7163"],
    jeans: ["photo-1542272454315-7ad9f8b4c3f6", "photo-1475178626620-a4d074967452", "photo-1541099649105-f69ad21f3246", "photo-1582552938357-32d9055ce190"],
    trousers: ["photo-1594938298603-c8148c4dae35", "photo-1475178626620-a4d074967452", "photo-1542272454315-7ad9f8b4c3f6", "photo-1617137968427-85924c800a22"],
    shorts: ["photo-1591195853828-11db59a44f6b", "photo-1562157873-818bc0726f68", "photo-1521572163474-6864f9cf17ab", "photo-1583743814966-8936f5b7be1a"],
    cargos: ["photo-1475178626620-a4d074967452", "photo-1541099649105-f69ad21f3246", "photo-1591195853828-11db59a44f6b", "photo-1542272454315-7ad9f8b4c3f6"],
    kurtas: ["photo-1617137968427-85924c800a22", "photo-1594938298603-c8148c4dae35", "photo-1602810318383-e386cc2a3ccf", "photo-1596755094514-f87e34085b81"],
    sherwanis: ["photo-1594938298603-c8148c4dae35", "photo-1617137968427-85924c800a22", "photo-1598033129183-c4f50c736f10", "photo-1602810318383-e386cc2a3ccf"],
    "ethnic sets": ["photo-1602810318383-e386cc2a3ccf", "photo-1617137968427-85924c800a22", "photo-1594938298603-c8148c4dae35", "photo-1596755094514-f87e34085b81"],
    briefs: ["photo-1489987707025-941f354c7163", "photo-1521572163474-6864f9cf17ab", "photo-1562157873-818bc0726f68", "photo-1583743814966-8936f5b7be1a"],
    vests: ["photo-1521572163474-6864f9cf17ab", "photo-1489987707025-941f354c7163", "photo-1618354691373-d851c5c3a990", "photo-1562157873-818bc0726f68"],
    thermals: ["photo-1551028719-00167b16eac5", "photo-1489987707025-941f354c7163", "photo-1544022613-e87ca75a784a", "photo-1591047139829-d91aecb6caea"],
    watches: ["photo-1523275335684-37898b6baf30", "photo-1524592094714-0f0654e20314", "photo-1533139502658-0198f680c22f", "photo-1508685096489-7aacd43bd3b1"],
    wallets: ["photo-1627123424574-724758594e93", "photo-1553062407-98eeb64c6a62", "photo-1606760227091-3dd870d97f1d", "photo-1590874106584-a7c2c47b1e20"],
    belts: ["photo-1624222247344-550fb60583fd", "photo-1553062407-98eeb64c6a62", "photo-1627123424574-724758594e93", "photo-1606760227091-3dd870d97f1d"],
    backpacks: ["photo-1553062407-98eeb64c6a62", "photo-1622560480605-d83c853bc5c3", "photo-1590874106584-a7c2c47b1e20", "photo-1491637639811-60e2756cc1c7"],
    sunglasses: ["photo-1572635196237-14b3f281503f", "photo-1511499767150-a48a237f0083", "photo-1473496169904-658ba7c44d8a", "photo-1574258495973-f010dfbb5147"],
    deodorants: ["photo-1556228578-0d85b1a4d571", "photo-1596462502278-27bfdc403348", "photo-1571875257727-256c39da42af", "photo-1522335789203-aabd1fc54bc9"],
    perfumes: ["photo-1541643600914-78b084683601", "photo-1594035910387-fea47794261f", "photo-1595425970375-c71cb4c8b0e0", "photo-1587017539504-67cfbddac569"],
    "beard care": ["photo-1621607512214-68297480165e", "photo-1503951914875-452162b0f3f1", "photo-1556228578-0d85b1a4d571", "photo-1596462502278-27bfdc403348"],
    shavers: ["photo-1621607512214-68297480165e", "photo-1503951914875-452162b0f3f1", "photo-1556228578-0d85b1a4d571", "photo-1596462502278-27bfdc403348"],
    nike: ["photo-1542291026-7eec264c27ff", "photo-1606107557195-0e29a4b5b4aa", "photo-1556906781-9a412961c28c", "photo-1595950653106-6c9ebd614d3a"],
    adidas: ["photo-1556906781-9a412961c28c", "photo-1542291026-7eec264c27ff", "photo-1606107557195-0e29a4b5b4aa", "photo-1525966223011-a87e74561f32"],
    puma: ["photo-1606107557195-0e29a4b5b4aa", "photo-1556906781-9a412961c28c", "photo-1595950653106-6c9ebd614d3a", "photo-1542291026-7eec264c27ff"],
    "levi's": ["photo-1542272454315-7ad9f8b4c3f6", "photo-1541099649105-f69ad21f3246", "photo-1475178626620-a4d074967452", "photo-1582552938357-32d9055ce190"],

    /* Women */
    tops: ["photo-1564257631407-4deb1f99d992", "photo-1485968579580-b6d095142e6e", "photo-1434389677669-e08b4cac3105", "photo-1551488831-00ddcb6c6bd3"],
    dresses: ["photo-1595777457583-95e059d581b8", "photo-1572804013309-59a88b7e92f1", "photo-1496747611176-843222e1e57c", "photo-1515372039744-b8f02a3ae446"],
    skirts: ["photo-1583496661160-fb5886a0aaaa", "photo-1551488831-00ddcb6c6bd3", "photo-1485968579580-b6d095142e6e", "photo-1564257631407-4deb1f99d992"],
    jumpsuits: ["photo-1515372039744-b8f02a3ae446", "photo-1496747611176-843222e1e57c", "photo-1595777457583-95e059d581b8", "photo-1572804013309-59a88b7e92f1"],
    sarees: ["photo-1610030469983-98e550d6193c", "photo-1583391733956-3750e0ff4e8b", "photo-1594633312681-425c7b97ccd1", "photo-1617627140170-ad769c1b1e0e"],
    kurtis: ["photo-1594633312681-425c7b97ccd1", "photo-1610030469983-98e550d6193c", "photo-1583391733956-3750e0ff4e8b", "photo-1617627140170-ad769c1b1e0e"],
    lehenga: ["photo-1583391733956-3750e0ff4e8b", "photo-1617627140170-ad769c1b1e0e", "photo-1610030469983-98e550d6193c", "photo-1594633312681-425c7b97ccd1"],
    "salwar suits": ["photo-1617627140170-ad769c1b1e0e", "photo-1594633312681-425c7b97ccd1", "photo-1583391733956-3750e0ff4e8b", "photo-1610030469983-98e550d6193c"],
    flats: ["photo-1543163521-1bf560ef43f3", "photo-1560769629-975ec94e6a86", "photo-1603487742131-4160ec999306", "photo-1515347619252-60a4bf4fff4f"],
    heels: ["photo-1543163521-1bf560ef43f3", "photo-1515347619252-60a4bf4fff4f", "photo-1560769629-975ec94e6a86", "photo-1603487742131-4160ec999306"],
    wedges: ["photo-1515347619252-60a4bf4fff4f", "photo-1543163521-1bf560ef43f3", "photo-1603487742131-4160ec999306", "photo-1560769629-975ec94e6a86"],
    "make up": ["photo-1596462502278-27bfdc403348", "photo-1522335789203-aabd1fc54bc9", "photo-1512496015851-a90fb38ba796", "photo-1571875257727-256c39da42af"],
    "skin care": ["photo-1556228578-0d85b1a4d571", "photo-1571875257727-256c39da42af", "photo-1596462502278-27bfdc403348", "photo-1522335789203-aabd1fc54bc9"],
    "silver jewellery": ["photo-1515562141207-7a88fb7ce338", "photo-1599643478518-a784e5dc4c8f", "photo-1611591437281-460bfbe1220a", "photo-1605100804763-247f67b3557e"],
    handbags: ["photo-1584917865442-de89df76afd3", "photo-1590874106584-a7c2c47b1e20", "photo-1548036328-c085554ea061", "photo-1566150905458-1bf1fc113f0d"],
    bras: ["photo-1489987707025-941f354c7163", "photo-1434389677669-e08b4cac3105", "photo-1564257631407-4deb1f99d992", "photo-1485968579580-b6d095142e6e"],
    panties: ["photo-1434389677669-e08b4cac3105", "photo-1489987707025-941f354c7163", "photo-1485968579580-b6d095142e6e", "photo-1564257631407-4deb1f99d992"],
    nightwear: ["photo-1515372039744-b8f02a3ae446", "photo-1434389677669-e08b4cac3105", "photo-1485968579580-b6d095142e6e", "photo-1496747611176-843222e1e57c"],
    leggings: ["photo-1506629082955-511b1aa78293", "photo-1541099649105-f69ad21f3246", "photo-1475178626620-a4d074967452", "photo-1551488831-00ddcb6c6bd3"],
    palazzos: ["photo-1551488831-00ddcb6c6bd3", "photo-1506629082955-511b1aa78293", "photo-1594633312681-425c7b97ccd1", "photo-1541099649105-f69ad21f3246"],
    shararas: ["photo-1594633312681-425c7b97ccd1", "photo-1610030469983-98e550d6193c", "photo-1551488831-00ddcb6c6bd3", "photo-1583391733956-3750e0ff4e8b"],
    analog: ["photo-1524592094714-0f0654e20314", "photo-1523275335684-37898b6baf30", "photo-1533139502658-0198f680c22f", "photo-1508685096489-7aacd43bd3b1"],
    biba: ["photo-1610030469983-98e550d6193c", "photo-1594633312681-425c7b97ccd1", "photo-1583391733956-3750e0ff4e8b", "photo-1617627140170-ad769c1b1e0e"],
    w: ["photo-1564257631407-4deb1f99d992", "photo-1485968579580-b6d095142e6e", "photo-1595777457583-95e059d581b8", "photo-1551488831-00ddcb6c6bd3"],
    lakme: ["photo-1596462502278-27bfdc403348", "photo-1522335789203-aabd1fc54bc9", "photo-1512496015851-a90fb38ba796", "photo-1571875257727-256c39da42af"],
    "titan raga": ["photo-1523275335684-37898b6baf30", "photo-1524592094714-0f0654e20314", "photo-1515562141207-7a88fb7ce338", "photo-1533139502658-0198f680c22f"],

    /* Food */
    fruits: ["photo-1619566636858-adf3ef4644af", "photo-1560806887-1e4cd0b6cbd6", "photo-1601004890684-d8cbf643f5f2", "photo-1519996529931-28324d5a24c9"],
    vegetables: ["photo-1540420773420-3366772f4999", "photo-1597362920023-123bba630cfd", "photo-1566385101042-1a0aa0c1268c", "photo-1518843875459-f3517845c2ca"],
    "leafy greens": ["photo-1512621776951-a57141f2eefd", "photo-1576045057995-568f588f82fb", "photo-1540420773420-3366772f4999", "photo-1566385101042-1a0aa0c1268c"],
    "organic fresh": ["photo-1488459716781-31db52582fe9", "photo-1542838132-92c53300491e", "photo-1619566636858-adf3ef4644af", "photo-1518843875459-f3517845c2ca"],
    "rice & grains": ["photo-1586201375761-83865001e31c", "photo-1536304993881-ff6e9eefa2a6", "photo-1516684669134-de6f7c473a2a", "photo-1574323347407-f5e1ad6d020b"],
    atta: ["photo-1574323347407-f5e1ad6d020b", "photo-1586201375761-83865001e31c", "photo-1536304993881-ff6e9eefa2a6", "photo-1509440159596-0249088772ff"],
    dals: ["photo-1516684669134-de6f7c473a2a", "photo-1586201375761-83865001e31c", "photo-1574323347407-f5e1ad6d020b", "photo-1536304993881-ff6e9eefa2a6"],
    oils: ["photo-1474979266404-7eaacbcd87c5", "photo-1608571423902-eed4a5adb885", "photo-1596040033229-a9821ebd058d", "photo-1628088062854-d1870b4553da"],
    spices: ["photo-1596040033229-a9821ebd058d", "photo-1608571423902-eed4a5adb885", "photo-1474979266404-7eaacbcd87c5", "photo-1542838132-92c53300491e"],
    tea: ["photo-1576092768241-dec231879fc3", "photo-1556679343-c7306c1976bc", "photo-1544787219-7f47ccb76574", "photo-1447933601403-0c6688de566e"],
    coffee: ["photo-1447933601403-0c6688de566e", "photo-1514432324607-a09d9b4aefdd", "photo-1495474472287-4d71bcdd2085", "photo-1509042239860-f550ce710b93"],
    juices: ["photo-1600271886742-f049cd451bba", "photo-1622597467836-f3285f2131b8", "photo-1613478223719-2ab2abbdc6bf", "photo-1546173159-315724a31605"],
    "health drinks": ["photo-1622597467836-f3285f2131b8", "photo-1600271886742-f049cd451bba", "photo-1556679343-c7306c1976bc", "photo-1546173159-315724a31605"],
    sauces: ["photo-1474979266404-7eaacbcd87c5", "photo-1608571423902-eed4a5adb885", "photo-1542838132-92c53300491e", "photo-1556910103-1c02745aae4d"],
    pickles: ["photo-1608571423902-eed4a5adb885", "photo-1596040033229-a9821ebd058d", "photo-1474979266404-7eaacbcd87c5", "photo-1542838132-92c53300491e"],
    "ready-to-cook": ["photo-1556910103-1c02745aae4d", "photo-1542838132-92c53300491e", "photo-1516684669134-de6f7c473a2a", "photo-1509440159596-0249088772ff"],
    pasta: ["photo-1551462147-3787040ec0f0", "photo-1621996346565-e3dbc646d9a9", "photo-1551183053-bf91a1d81141", "photo-1542838132-92c53300491e"],
    milk: ["photo-1563636619-e9143da7973b", "photo-1550583724-b2692b85b150", "photo-1628088062854-d1870b4553da", "photo-1571212515416-fef01fc43637"],
    curd: ["photo-1488477181946-6428a0291777", "photo-1563636619-e9143da7973b", "photo-1550583724-b2692b85b150", "photo-1628088062854-d1870b4553da"],
    cheese: ["photo-1486297678162-eb2a19b0a32d", "photo-1452195100486-9cc805987862", "photo-1488477181946-6428a0291777", "photo-1550583724-b2692b85b150"],
    butter: ["photo-1589985270826-4b7bb135bc9d", "photo-1486297678162-eb2a19b0a32d", "photo-1452195100486-9cc805987862", "photo-1488477181946-6428a0291777"],
    eggs: ["photo-1582722872445-44dc5f7e3c8f", "photo-1506976785307-45a436d0d9e9", "photo-1498654077810-12c21d4d6dc3", "photo-1563636619-e9143da7973b"],
    cereals: ["photo-1526318472351-c75fcf070305", "photo-1509440159596-0249088772ff", "photo-1516684669134-de6f7c473a2a", "photo-1482049016688-2d3e1b311543"],
    oats: ["photo-1516684669134-de6f7c473a2a", "photo-1526318472351-c75fcf070305", "photo-1509440159596-0249088772ff", "photo-1482049016688-2d3e1b311543"],
    honey: ["photo-1587049352846-4a222e784d38", "photo-1558642452-9d2a7deb7f62", "photo-1471943311424-646960669eb4", "photo-1587049352851-8d4e89133924"],
    bread: ["photo-1509440159596-0249088772ff", "photo-1549931319-a545dcf3bc73", "photo-1482049016688-2d3e1b311543", "photo-1526318472351-c75fcf070305"],
    namkeen: ["photo-1599490659213-e2b9527bd087", "photo-1558961363-fa8fdf82db35", "photo-1499636136210-6f4ee915583e", "photo-1548907040-4baa42d10919"],
    biscuits: ["photo-1558961363-fa8fdf82db35", "photo-1499636136210-6f4ee915583e", "photo-1599490659213-e2b9527bd087", "photo-1548907040-4baa42d10919"],
    chocolates: ["photo-1548907040-4baa42d10919", "photo-1511381939415-e44015466834", "photo-1499636136210-6f4ee915583e", "photo-1558961363-fa8fdf82db35"],
    "dry fruits": ["photo-1599599810769-bcde5a160d32", "photo-1606923829579-0cb981a83e2e", "photo-1508747703725-719777637510", "photo-1619566636858-adf3ef4644af"],
    "organic pantry": ["photo-1542838132-92c53300491e", "photo-1488459716781-31db52582fe9", "photo-1604719312566-8912e9227c6a", "photo-1556910103-1c02745aae4d"],
    "bulk buy": ["photo-1604719312566-8912e9227c6a", "photo-1542838132-92c53300491e", "photo-1586201375761-83865001e31c", "photo-1516684669134-de6f7c473a2a"],
    amul: ["photo-1563636619-e9143da7973b", "photo-1486297678162-eb2a19b0a32d", "photo-1550583724-b2692b85b150", "photo-1488477181946-6428a0291777"],
    aashirvaad: ["photo-1574323347407-f5e1ad6d020b", "photo-1509440159596-0249088772ff", "photo-1586201375761-83865001e31c", "photo-1536304993881-ff6e9eefa2a6"],

    /* Sports / Books / Farm / Kids / Home — common leaf names */
    cricket: ["photo-1531415074968-036ba1b575da", "photo-1540747913346-19e32dc3e97e", "photo-1624526267942-ab0ff8dd0e4e", "photo-1461896836934-ffe607ba6850"],
    badminton: ["photo-1626224583764-f87db24ac4ea", "photo-1461896836934-ffe607ba6850", "photo-1551958219-acbc608c6377", "photo-1517836357463-d25dfeac3438"],
    football: ["photo-1551958219-acbc608c6377", "photo-1579952363873-27f3bade9f55", "photo-1461896836934-ffe607ba6850", "photo-1574629810360-7efbbe195018"],
    cycling: ["photo-1485965120184-e220f721d03e", "photo-1517649763962-0c623066027c", "photo-1571068316344-75bc76f77890", "photo-1507035895480-2b3156c31fc8"],
    swimming: ["photo-1519315901367-f34ff9154487", "photo-1530549387789-4c1017266635", "photo-1576610616656-d3aa5d1f4618", "photo-1600965962102-9d260a71890d"],
    fiction: ["photo-1512820790803-83ca734da794", "photo-1544947950-fa07a98d237f", "photo-1495446815901-a7297e633e8d", "photo-1519682337058-a94d519337bc"],
    "self-help": ["photo-1544947950-fa07a98d237f", "photo-1512820790803-83ca734da794", "photo-1495446815901-a7297e633e8d", "photo-1519682337058-a94d519337bc"],
    academics: ["photo-1495446815901-a7297e633e8d", "photo-1519682337058-a94d519337bc", "photo-1512820790803-83ca734da794", "photo-1544947950-fa07a98d237f"],
    children: ["photo-1512820790803-83ca734da794", "photo-1503454537195-1dcabb73ffb9", "photo-1495446815901-a7297e633e8d", "photo-1544947950-fa07a98d237f"],
    dumbbells: ["photo-1517836357463-d25dfeac3438", "photo-1571019614242-c5c5dee9f50b", "photo-1534438327276-14e5300c3a48", "photo-1583454110551-21f2fa2afe61"],
    "yoga mat": ["photo-1544367567-0f2fcb009e0b", "photo-1571019614242-c5c5dee9f50b", "photo-1517836357463-d25dfeac3438", "photo-1506126613408-eca07a68774b"],
    "home gyms": ["photo-1534438327276-14e5300c3a48", "photo-1517836357463-d25dfeac3438", "photo-1583454110551-21f2fa2afe61", "photo-1571019614242-c5c5dee9f50b"],
    cardio: ["photo-1534438327276-14e5300c3a48", "photo-1571019614242-c5c5dee9f50b", "photo-1517836357463-d25dfeac3438", "photo-1476480830812-486ee80be815"],
    "vegetable seeds": ["photo-1464226184884-fa280b87c399", "photo-1416879595882-3373a0480b5b", "photo-1592419044706-39796d40f98c", "photo-1523348837708-15d4a09cfac2"],
    "flower seeds": ["photo-1490750967868-88aa4486c946", "photo-1464226184884-fa280b87c399", "photo-1416879595882-3373a0480b5b", "photo-1523348837708-15d4a09cfac2"],
    "herb seeds": ["photo-1416879595882-3373a0480b5b", "photo-1464226184884-fa280b87c399", "photo-1592419044706-39796d40f98c", "photo-1466692476866-aef1dfb1e735"],
    "fruit saplings": ["photo-1523348837708-15d4a09cfac2", "photo-1464226184884-fa280b87c399", "photo-1416879595882-3373a0480b5b", "photo-1592419044706-39796d40f98c"],
    "hand tools": ["photo-1416879595882-3373a0480b5b", "photo-1592419044706-39796d40f98c", "photo-1466692476866-aef1dfb1e735", "photo-1464226184884-fa280b87c399"],
    "indoor plants": ["photo-1466692476866-aef1dfb1e735", "photo-1485955900006-10f4d324d411", "photo-1416879595882-3373a0480b5b", "photo-1459411621453-7b03977f4bfc"],
    succulents: ["photo-1459411621453-7b03977f4bfc", "photo-1485955900006-10f4d324d411", "photo-1466692476866-aef1dfb1e735", "photo-1509423350716-bf32f48c73f0"],
  };

  const CATEGORY_FALLBACK_IMAGES = {
    electronics: ["photo-1498049794561-7780e7231661", "photo-1511707171634-5f897ff02aa9", "photo-1496181133206-80ce9b88a853", "photo-1516035069371-29a1b244cc32"],
    appliances: ["photo-1574269909862-7e1d70bb8078", "photo-1571175443880-49e1d25b2bc5", "photo-1585659722983-3a675dabf23d", "photo-1556911220-bff31c812dba"],
    men: ["photo-1617137968427-85924c800a22", "photo-1594938298603-c8148c4dae35", "photo-1542291026-7eec264c27ff", "photo-1521572163474-6864f9cf17ab"],
    women: ["photo-1485968579580-b6d095142e6e", "photo-1595777457583-95e059d581b8", "photo-1610030469983-98e550d6193c", "photo-1596462502278-27bfdc403348"],
    kids: ["photo-1503454537195-1dcabb73ffb9", "photo-1515488042361-ee00e0ddd4e4", "photo-1566576912321-d58ddd7a6088", "photo-1587654780291-39c9404d746b"],
    home: ["photo-1555041469-a586c61ea9bc", "photo-1586023492125-27b2c045efd7", "photo-1556911220-bff31c812dba", "photo-1616486338812-3dadae4b4ace"],
    sports: ["photo-1461896836934-ffe607ba6850", "photo-1517836357463-d25dfeac3438", "photo-1512820790803-83ca734da794", "photo-1540747913346-19e32dc3e97e"],
    farm: ["photo-1464226184884-fa280b87c399", "photo-1416879595882-3373a0480b5b", "photo-1466692476866-aef1dfb1e735", "photo-1592419044706-39796d40f98c"],
    food: ["photo-1542838132-92c53300491e", "photo-1488459716781-31db52582fe9", "photo-1619566636858-adf3ef4644af", "photo-1556910103-1c02745aae4d"],
  };

  function norm(s) {
    return (s || "").trim().toLowerCase();
  }

  function formatPrice(n) {
    return `₹${Number(n).toLocaleString("en-IN")}`;
  }

  function pageTitle() {
    if (state.item) return state.item;
    if (state.group) return state.group;
    return CATEGORY_LABELS[state.cat] || "Products";
  }

  function resolveFilterPreset() {
    const itemKey = norm(state.item);
    const groupKey = norm(state.group);

    if (itemKey && ITEM_FILTER_MAP[itemKey]) return ITEM_FILTER_MAP[itemKey];
    if (itemKey.includes("power bank")) return "powerBanks";
    if (itemKey.includes("case")) return "mobileCases";
    if (groupKey && GROUP_FILTER_MAP[groupKey]) return GROUP_FILTER_MAP[groupKey];
    if (state.cat === "men" || state.cat === "women") return "men";
    if (state.cat === "farm") return "farm";
    if (state.cat === "food") return "food";
    if (state.cat === "electronics" && !state.group) return "mobiles";
    return "default";
  }

  function activeFilterSet() {
    return els.filters?.querySelector(".pl-filter-set:not([hidden])") || els.filters;
  }

  function showFilterPreset() {
    const preset = resolveFilterPreset();
    els.filters?.querySelectorAll(".pl-filter-set").forEach((set) => {
      set.hidden = set.dataset.preset !== preset;
    });
  }

  function renderBreadcrumb() {
    const parts = [
      { label: "Home", href: "ch-trading.html" },
      {
        label: CATEGORY_LABELS[state.cat] || state.cat,
        href: `product-list.html?cat=${encodeURIComponent(state.cat)}`,
      },
    ];
    if (state.group) {
      parts.push({
        label: state.group,
        href: `product-list.html?cat=${encodeURIComponent(state.cat)}&group=${encodeURIComponent(state.group)}`,
      });
    }
    if (state.item) parts.push({ label: state.item, href: null });

    els.breadcrumb.innerHTML = parts
      .map((p, idx) => {
        const isLast = idx === parts.length - 1;
        if (isLast) return `<span aria-current="page">${p.label}</span>`;
        return `<a href="${p.href}">${p.label}</a><span aria-hidden="true">›</span>`;
      })
      .join(" ");
  }

  function highlightActiveCategory() {
    document.querySelectorAll(".category-item").forEach((el) => {
      const href = el.getAttribute("href") || "";
      el.classList.toggle("is-active", href.includes(`cat=${state.cat}`));
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function imagesForSubcat(name, cat, index) {
    const key = norm(name);
    const ids =
      SUBCAT_IMAGES[key] ||
      CATEGORY_FALLBACK_IMAGES[cat] ||
      CATEGORY_FALLBACK_IMAGES.electronics;
    const rotated = ids.map((_, i) => ids[(i + (index % ids.length)) % ids.length]);
    return rotated.slice(0, 4).map(img);
  }

  function collectSubcategories(cat) {
    const dropdown = document.querySelector(
      `.category-nav .category-dropdown[data-mega="${cat}"]`
    );
    if (!dropdown) return [];

    const seen = new Set();
    const items = [];

    dropdown.querySelectorAll(".mega-group").forEach((group) => {
      const links = [...group.querySelectorAll(".mega-list a")];
      if (links.length) {
        links.forEach((a) => {
          const name = (a.textContent || "").replace(/\s+/g, " ").trim();
          const href = a.getAttribute("href") || "";
          if (!name || seen.has(norm(name))) return;
          seen.add(norm(name));
          items.push({ name, href });
        });
        return;
      }

      const heading = group.querySelector(".mega-heading");
      if (!heading) return;
      const name = (
        heading.querySelector(".mega-heading-text")?.textContent ||
        heading.textContent ||
        ""
      )
        .replace(/\s+/g, " ")
        .trim();
      const href = heading.getAttribute("href") || "";
      if (!name || seen.has(norm(name))) return;
      seen.add(norm(name));
      items.push({ name, href });
    });

    return items;
  }

  function renderSubcatGallery() {
    const gallery = els.subcatGallery;
    if (!gallery) return;

    if (!SUBCAT_MQ.matches) {
      gallery.hidden = true;
      gallery.innerHTML = "";
      return;
    }

    const items = collectSubcategories(state.cat);
    if (!items.length) {
      gallery.hidden = true;
      gallery.innerHTML = "";
      return;
    }

    gallery.innerHTML = items
      .map((item, index) => {
        const images = imagesForSubcat(item.name, state.cat, index);
        const bg = CARD_BG[index % CARD_BG.length];
        const href = item.href || `ch-product-list.html?cat=${encodeURIComponent(state.cat)}`;
        return `<a href="${escapeHtml(href)}" class="pl-subcat-card" style="--card-bg:${bg}">
          <div class="pl-subcat-media">
            ${images
              .map(
                (src) =>
                  `<img src="${escapeHtml(src)}" alt="" loading="lazy" width="100" height="100" />`
              )
              .join("")}
          </div>
          <div class="pl-subcat-footer">
            <strong>${escapeHtml(item.name)}</strong>
            <span>Explore <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
          </div>
        </a>`;
      })
      .join("");

    gallery.hidden = false;
  }

  function readFilters() {
    const set = activeFilterSet();
    const filters = {};
    if (!set) return filters;

    set.querySelectorAll('input[type="checkbox"][data-filter]:checked').forEach((cb) => {
      const id = cb.dataset.filter;
      if (!filters[id]) filters[id] = [];
      filters[id].push(cb.value);
    });

    set.querySelectorAll('input[type="range"][data-filter]').forEach((range) => {
      const max = Number(range.max);
      const value = Number(range.value);
      if (value < max) filters[range.dataset.filter] = { max: value };
    });

    return filters;
  }

  function cardAttr(card, id) {
    return card.getAttribute(`data-${id.toLowerCase()}`) || "";
  }

  function matchesContext(card) {
    if (state.cat && card.dataset.cat !== state.cat) return false;
    if (state.group && norm(card.dataset.group) !== norm(state.group)) return false;
    if (state.item && norm(card.dataset.item) !== norm(state.item)) return false;
    return true;
  }

  function productMatchesFilters(card, filters) {
    return Object.entries(filters).every(([id, val]) => {
      if (Array.isArray(val) && val.length) {
        if (id === "rating") {
          const min = val.some((v) => v.includes("4")) ? 4 : 3;
          return Number(card.dataset.rating) >= min;
        }
        if (id === "discount") {
          const minDisc = Math.min(...val.map((v) => parseInt(v, 10) || 0));
          return Number(card.dataset.discount) >= minDisc;
        }
        const attr = cardAttr(card, id);
        const specs = card.querySelector(".pl-card-specs")?.textContent || "";
        return val.some((v) => attr === v || specs.includes(v));
      }
      if (val && typeof val === "object" && val.max != null) {
        return Number(card.dataset.price) <= val.max;
      }
      return true;
    });
  }

  function sortCards(list) {
    const sorted = [...list];
    switch (state.sort) {
      case "price-asc":
        sorted.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
        break;
      case "rating":
        sorted.sort((a, b) => Number(b.dataset.rating) - Number(a.dataset.rating));
        break;
      case "newest":
        sorted.sort((a, b) => (b.dataset.id || "").localeCompare(a.dataset.id || ""));
        break;
      case "popularity":
        sorted.sort((a, b) => Number(b.dataset.reviews) - Number(a.dataset.reviews));
        break;
      default:
        break;
    }
    return sorted;
  }

  function capitalize(s) {
    return s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
  }

  function renderApplied(filters) {
    const chips = [];
    const sortLabel = SORT_LABELS[state.sort];
    if (sortLabel && state.sort !== "relevance") {
      chips.push({ key: "__sort", label: `Sort: ${sortLabel}` });
    }
    Object.entries(filters).forEach(([id, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => chips.push({ key: `${id}::${v}`, label: `${capitalize(id)}: ${v}` }));
      } else if (val && typeof val === "object" && val.max != null) {
        chips.push({ key: id, label: `Price: up to ${formatPrice(val.max)}` });
      }
    });

    if (!chips.length) {
      els.applied.innerHTML = `<span class="pl-applied-empty">No filters applied</span>`;
      return;
    }
    els.applied.innerHTML = chips
      .map(
        (c) =>
          `<span class="pl-chip">${c.label}<button type="button" data-remove="${c.key}" aria-label="Remove filter">×</button></span>`
      )
      .join("");
  }

  function renderSortTabs() {
    els.sortTabs?.querySelectorAll("[data-sort]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.sort === state.sort);
    });
  }

  function syncWishlistButtons() {
    els.grid?.querySelectorAll("[data-wish]").forEach((btn) => {
      const on = state.wishlist.has(btn.dataset.wish);
      btn.classList.toggle("is-active", on);
      const icon = btn.querySelector("i");
      if (icon) icon.className = on ? "fa-solid fa-heart" : "fa-regular fa-heart";
    });
  }

  function applyView() {
    const filters = readFilters();
    const cards = [...(els.grid?.querySelectorAll(".pl-card") || [])];
    const inContext = cards.filter(matchesContext);
    const matched = sortCards(inContext.filter((card) => productMatchesFilters(card, filters)));

    cards.forEach((card) => {
      card.hidden = true;
    });
    matched.forEach((card) => {
      card.hidden = false;
      els.grid.appendChild(card);
    });

    const showing = matched.length;
    const total = inContext.length;
    els.title.textContent = pageTitle();
    els.count.textContent =
      showing > 0
        ? `(Showing 1 – ${showing} products of ${total.toLocaleString("en-IN")} products)`
        : `(Showing 0 of ${total.toLocaleString("en-IN")} products)`;
    els.empty.hidden = showing > 0;

    renderApplied(filters);
    renderSortTabs();
    syncWishlistButtons();
  }

  function resetFilterInputs() {
    els.filters?.querySelectorAll('input[type="checkbox"][data-filter]').forEach((cb) => {
      cb.checked = false;
    });
    els.filters?.querySelectorAll('input[type="range"][data-filter]').forEach((range) => {
      range.value = range.max;
      const label = range.closest(".pl-price-range")?.querySelector(".pl-price-labels span:last-child");
      if (label) label.textContent = formatPrice(Number(range.max));
    });
  }

  function updateCartBadge() {
    document.querySelectorAll(".cart-badge").forEach((el) => {
      el.textContent = String(state.cartCount);
    });
  }

  function bindEvents() {
    els.sortTabs?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sort]");
      if (!btn) return;
      state.sort = btn.dataset.sort;
      applyView();
    });

    els.filters?.addEventListener("change", (e) => {
      if (!e.target.closest("[data-filter]")) return;
      applyView();
    });

    els.filters?.addEventListener("input", (e) => {
      const range = e.target.closest("[data-range]");
      if (!range) return;
      const label = range.closest(".pl-price-range")?.querySelector(".pl-price-labels span:last-child");
      if (label) label.textContent = formatPrice(Number(range.value));
      applyView();
    });

    els.applied?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn) return;
      const key = btn.dataset.remove;
      const set = activeFilterSet();

      if (key === "__sort") {
        state.sort = "relevance";
      } else if (key.includes("::")) {
        const [id, val] = key.split("::");
        set?.querySelectorAll(`input[type="checkbox"][data-filter="${id}"]`).forEach((cb) => {
          if (cb.value === val) cb.checked = false;
        });
      } else {
        set?.querySelectorAll(`input[type="range"][data-filter="${key}"]`).forEach((range) => {
          range.value = range.max;
          const label = range.closest(".pl-price-range")?.querySelector(".pl-price-labels span:last-child");
          if (label) label.textContent = formatPrice(Number(range.max));
        });
      }
      applyView();
    });

    els.clearAll?.addEventListener("click", () => {
      state.sort = "popularity";
      resetFilterInputs();
      applyView();
    });

    els.grid?.addEventListener("click", (e) => {
      const wish = e.target.closest("[data-wish]");
      const cart = e.target.closest("[data-cart]");
      if (wish) {
        const id = wish.dataset.wish;
        if (state.wishlist.has(id)) state.wishlist.delete(id);
        else state.wishlist.add(id);
        sessionStorage.setItem("plWishlist", JSON.stringify([...state.wishlist]));
        syncWishlistButtons();
      }
      if (cart) {
        state.cartCount += 1;
        sessionStorage.setItem("plCartCount", String(state.cartCount));
        updateCartBadge();
      }
    });

    els.fab?.addEventListener("click", () => {
      els.sidebar?.classList.add("is-open");
      els.backdrop?.classList.add("is-visible");
      els.backdrop.hidden = false;
    });

    els.closeSidebar?.addEventListener("click", closeSidebar);
    els.backdrop?.addEventListener("click", closeSidebar);
  }

  function closeSidebar() {
    els.sidebar?.classList.remove("is-open");
    els.backdrop?.classList.remove("is-visible");
    els.backdrop.hidden = true;
  }

  if (els.grid) {
    bindEvents();
    renderBreadcrumb();
    showFilterPreset();
    highlightActiveCategory();
    renderSubcatGallery();
    applyView();
    updateCartBadge();

    const onViewportChange = () => renderSubcatGallery();
    if (typeof SUBCAT_MQ.addEventListener === "function") {
      SUBCAT_MQ.addEventListener("change", onViewportChange);
    } else if (typeof SUBCAT_MQ.addListener === "function") {
      SUBCAT_MQ.addListener(onViewportChange);
    }
  }
})();
