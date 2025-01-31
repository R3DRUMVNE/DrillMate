export const passportBlock = [
    {
        header: "generalInfo",
        blockCheckbox: false,
        input: [
            {
                name: "passNumber",
                passportDisplay: false,
                kind: "input",
                type: "text",
                checkbox: true,
                inTableVision: "default",
            },
            {
                name: "wellLocation",
                passportDisplay: true,
                kind: "textarea",
                type: null,
                checkbox: false,
                inTableVision: "default",
            },
            {
                name: "drillMaster",
                passportDisplay: true,
                kind: "input",
                type: "text",
                checkbox: false,
                inTableVision: "default",
            },
            {
                name: "drillMasterContacts",
                passportDisplay: true,
                kind: "input",
                type: "text",
                checkbox: false,
                inTableVision: "default",
            },
            {
                name: "customer",
                passportDisplay: true,
                kind: "input",
                type: "text",
                checkbox: false,
                inTableVision: "default",
            },
            {
                name: "customerContacts",
                passportDisplay: true,
                kind: "input",
                type: "text",
                checkbox: false,
                inTableVision: "default",
            },
            {
                name: "startWork",
                passportDisplay: true,
                kind: "input",
                type: "datetime-local",
                checkbox: false,
                inTableVision: "default",
            },
            {
                name: "endWork",
                passportDisplay: true,
                kind: "input",
                type: "datetime-local",
                checkbox: false,
                inTableVision: "default",
            },
        ],
    },
    {
        header: "wellParams",
        blockCheckbox: false,
        input: [
            {
                name: "wellType",
                passportDisplay: true,
                kind: "select",
                type: null,
                checkbox: false,
                inTableVision: "default",
            },
            {
                name: "pipesUsed",
                passportDisplay: true,
                kind: "input",
                type: "text",
                checkbox: false,
                inTableVision: "default",
            },
            {
                name: "wellDepth",
                passportDisplay: true,
                kind: "input",
                type: "tel",
                checkbox: false,
                inTableVision: "default",
            },
            {
                name: "appliedFilter",
                passportDisplay: true,
                kind: "input",
                type: "text",
                checkbox: false,
                inTableVision: "default",
            },
            {
                name: "filterLength",
                passportDisplay: true,
                kind: "input",
                type: "tel",
                checkbox: false,
                inTableVision: "default",
            },
            {
                name: "staticLevel",
                passportDisplay: true,
                kind: "input",
                type: "tel",
                checkbox: false,
                inTableVision: "default",
            },
            {
                name: "dynamicLevel",
                passportDisplay: true,
                kind: "input",
                type: "tel",
                checkbox: true,
                inTableVision: "default",
            },
            {
                name: "flowRate",
                passportDisplay: true,
                kind: "input",
                type: "tel",
                checkbox: false,
                inTableVision: "default",
            },
        ],
    },
    {
        header: "wb",
        blockCheckbox: true,
        input: [
            {
                name: "wb",
                passportDisplay: true,
                kind: "textarea",
                type: null,
                checkbox: false,
                inTableVision: "noLabel",
            },
        ],
    },
    {
        header: "rb",
        blockCheckbox: false,
        input: [
            {
                name: "pump",
                passportDisplay: true,
                kind: "textarea",
                type: null,
                checkbox: false,
                inTableVision: "upperLabel",
            },
            {
                name: "extraRecommend",
                passportDisplay: true,
                kind: "textarea",
                type: null,
                checkbox: true,
                inTableVision: "upperLabel",
            },
        ],
    }
];