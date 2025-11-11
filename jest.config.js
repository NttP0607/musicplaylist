export default {
    testEnvironment: "node",
    transform: {}, // Tắt transform mặc định của Jest vì ESM không cần Babel transform ở đây
    moduleFileExtensions: ["js", "json"],
};