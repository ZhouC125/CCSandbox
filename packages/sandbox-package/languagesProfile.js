
module.exports = {
    load() {
        var languages = {
            currentTemplage: "",
            currentLanguage: "",
            templates: [],
            languages: [],
            textKeyValueMap: {},
            spriteKeyValueMap: {},
            audioKeyValueMap: {},
        }

        var profile = Editor.Profile.load('profile://project/languages.json')
        for (const key in languages) {
            if (languages.hasOwnProperty(key)) {
                const value = languages[key];
                if (!profile.get(key)) {
                    profile.set(key, value)
                }
            }
        }
        return profile
    },

}
