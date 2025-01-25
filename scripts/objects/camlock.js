export const camlockSizes = ["050", "075", "100", "125", "150", "200", "250", "300", "400", "500", "600"];
export const camlockThreadSizes = ["1/2\" | 20мм", "3/4\" | 25мм", "1\" | 32мм", "1-1/4\" | 40мм", "1-1/2\" | 46мм", "2\" | 58мм", "2-1/2\" |74мм", "3\" | 86мм", "4\" | 111мм", "5\" | 137мм", "6\" | 162мм"];
export const hoseFittingSizes = ["12мм | 1/2\"", "20мм | 3/4\"", "25мм | 1\"", "32мм | 1-1/4\"", "40мм | 1-1/2\"", "50мм | 2\"", "65мм | 2-1/2\"", "80мм | 3\"", "100мм | 4\"", "125мм | 5\"", "152мм | 6\""];

export const camlockObject = {
    text: "Камлок",
    id: "camlock",
    reversible: true,
    typeSize: camlockSizes,
    type: [
        {
            name: "A",
            connection: "Father_InternalThread",
            extraSizes: camlockThreadSizes,
        },
        {
            name: "B",
            connection: "Mother_ExternalThread",
            extraSizes: camlockThreadSizes,
        },
        {
            name: "C",
            connection: "Mother_HoseFitting",
            extraSizes: hoseFittingSizes,
        },
        {
            name: "D",
            connection: "Mother_InternalThread",
            extraSizes: camlockThreadSizes,
        },
        {
            name: "E",
            connection: "Father_HoseFitting",
            extraSizes: hoseFittingSizes,
        },
        {
            name: "F",
            connection: "Father_ExternalThread",
            extraSizes: camlockThreadSizes,
        },
        {
            name: "DP",
            connection: "Father_Stub",
        },
        {
            name: "DC",
            connection: "Mother_Stub",
        },
    ],
};

export const camlockImageSizes = [
    {
        name: "Шланг H",
        partOfType: "C_E",
        size: hoseFittingSizes,
    },
    {
        name: "P",
        partOfType: "A_E_F",
        size: ["13мм", "20мм", "23мм", "29мм", "37мм", "48мм", "60мм", "74мм", "105мм", "125мм", "152мм"]
    },
    {
        name: "Резьба R",
        partOfType: "A_B_D_F",
        size: camlockThreadSizes,
    },
    {
        name: "K",
        partOfType: "D",
        size: ["14мм", "21мм", "26мм", "35мм", "38мм", "46мм", "56мм", "73мм", "98мм", "128мм", "144мм"]
    },
    {
        name: "E",
        partOfType: "B",
        size: ["15мм", "18мм", "24мм", "31мм", "38мм", "49мм", "62мм", "75мм", "101мм", "122мм", "150мм"]
    },
    {
        name: "Размер под ключ V",
        partOfType: "A_D_F",
        size: ["24мм", "32мм", "43мм", "58мм", "56мм", "68мм", "85мм", "102мм", "126мм"]
    },
];