<template>
    <select v-model="lang">
        <option value="en">English</option>
        <option value="ar">Arabic</option>
    </select>
</template>

<script>
import { mapState } from 'pinia';
import { useGeneralStore } from '../stores/general';

export default {
    data() {
        return {
            lang: "en"
        }
    },
    
    created() {
        this.lang = this.language;
        this.setLayoutDirection()
    },

    methods: {
        setLayoutDirection() {
            if (this.language == 'ar') {
                document.getElementsByTagName("html")[0].dir = 'rtl';
                document.getElementsByTagName("html")[0].lang = 'ar';
            } else {
                document.getElementsByTagName("html")[0].dir = 'ltr';
                document.getElementsByTagName("html")[0].lang = 'en';
            }
        }
    },
    
    computed: {
        ...mapState(useGeneralStore, ['language'])
    },
    
    watch: {
        lang(current) {
            const state = useGeneralStore()
            state.$patch({ language: current })
            this.$i18n.locale = current
            localStorage.setItem("language", current);
            this.setLayoutDirection()
        }
    }

}

</script>