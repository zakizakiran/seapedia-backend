const escapeHtml = (text) => {
    if (typeof text !== 'string') return text;

    const htmlEntities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
    };

    return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
};

module.exports = {
    escapeHtml,
};
