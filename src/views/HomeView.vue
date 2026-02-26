<template>
    <div class="container">
        <div class="row ">
            <div class="card col-md-3 col-sm-6 col-12">
                <img src="../assets/images/personality-tests.webp" class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title">{{ title }}</h5>
                    <p class="card-text">{{ description }}</p>
                    <RouterLink class="btn btn-primary mt-3" to="briggs-test">
                        {{router_text}}
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { RouterLink } from 'vue-router';
import { useGeneralStore } from '../stores/general';
import { mapState } from 'pinia';

// Later we need to use i18n package
export default {
    data() {
        return {
            title_ar:"اختبار شخصية مايرز بريجز",
            title_en:"Myers Briggs Personality Test",
            router_text_ar:"قدم الاختبار",
            router_text_en:"Take exam",
            description_ar: "نموذج قصير كمثال يُبنى عليه عنوان البطاقة وتشكيل جزء كبير من محتواها",
            description_en: "A short form is an example that builds on the title of the card and makes up a large portion of its content"
        }
    },
    computed: {
        ...mapState(useGeneralStore, ['language']),
        title() {
            if (this.language == 'en') {
                return this.title_en;
            } 
            return this.title_ar;
        },
        description() {
            if (this.language == 'en') {
                return this.description_en;
            } 
            return this.description_ar;
        },

        router_text() {
            if (this.language == 'en') {
                return this.router_text_en;
            } 
            return this.router_text_ar;
        },


    }
}
</script>