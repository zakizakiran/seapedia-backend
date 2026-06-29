let offsetMs = 0;

const getCurrentTime = () => {
    return new Date(Date.now() + offsetMs);
};

const advanceDays = (days) => {
    offsetMs += days * 24 * 60 * 60 * 1000;
    return getCurrentTime();
};

const resetTime = () => {
    offsetMs = 0;
    return getCurrentTime();
};

const getTimeOffset = () => {
    return {
        offsetMs,
        offsetDays: Math.floor(offsetMs / (24 * 60 * 60 * 1000)),
        simulatedTime: getCurrentTime(),
        realTime: new Date(),
    };
};

module.exports = {
    getCurrentTime,
    advanceDays,
    resetTime,
    getTimeOffset,
};
