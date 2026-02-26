<template>
  <div class="container mb-5">
    <div class="row" v-if="!finalResult">
      <div class="col-12">
        <p class="fw-bold">{{ index + 1 }}. {{ questions[index].text }}</p>
        <div :key="index + ' ' + answer.text" v-for="(answer, key) in questions[index].answers">
          <input :type="questions[index].type == 'one-choice' ? 'radio' : 'checkbox'" :name="answer.text"
            v-model="currentAnswer" :value="{ category: answer.category, proportion: answer.proportion, key: key }"
            :id="answer.text" class="radioOption">
          <label :for="answer.text" class="box first">
            <div class="course">
              <span class="circle"></span>
              <span class="subject"> {{ answer.text }} </span>
            </div>
          </label>
        </div>
      </div>

      <div class="col-12">
        <div class="d-flex justify-content-between">
          <button :disabled="index == 0" class="btn btn-warning px-4 py-2 fw-bold" @click="previousQuestion">
            {{ language == 'en' ? "Previous" : "السابق" }}
          </button>
          <button :disabled="!currentAnswer" class="btn btn-primary px-4 py-2 fw-bold" @click="nextQuestion">
            {{ language == 'en' ? "Next" : "التالي" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Final Result -->
    <div v-else>
      <div class="modal-header">
        <h3 class="text-center">Final Result</h3>
      </div>
      <div class="modal-body text-center">
        <h1>
          <span v-for="(item, resultIndex) in finalResult">
            {{ item.category }}
            <span v-if="resultIndex != finalResult.length - 1"> - </span>
          </span>
        </h1>
        <hr>
        <div v-for="couple in finalResultCouples">
          <div v-for="letter in couple">
            <h3><strong>{{ letter.category }}:</strong> {{ letter.score }}</h3>
          </div>
          <hr>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { questionsArray as questionsEnArray } from '../../assets/js/data.en'
import { questionsArray as questionsArArray } from '../../assets/js/data.ar'
import { mapState } from 'pinia';
import { useGeneralStore } from '../../stores/general';

export default {
  data() {
    return {
      index: 0,
      currentAnswer: null,
      categories: [
        ["E", "I"],
        ["S", "N"],
        ["T", "F"],
        ["J", "P"],
      ],
      questions: [], // imported using script tag from another file
      finalResult: null,
      userAnswers: [],
      finalResultCouples:null
    };
  },
  created() {
    if (this.language == 'en') {
      this.questions = questionsEnArray;
    } else {
      this.questions = questionsArArray;
    }
  },

  methods: {
    previousQuestion() {
      this.currentAnswer = this.userAnswers[this.index - 1];
      this.index--;
    },

    nextQuestion() {
      this.userAnswers[this.index] = this.currentAnswer;

      if (this.index !== this.questions.length - 1) { // if not last question 
        if (this.userAnswers[this.index + 1]) { // user has previous answer
          this.currentAnswer = this.userAnswers[this.index + 1];
        } else if (this.questions[this.index + 1].type == 'one-choice') { // answer is one value
          this.currentAnswer = null
        } else { // multi-choice
          this.currentAnswer = []
        }

        this.index++; // add condition

      } else {
        this.finishTest()
      }
    },
    finishTest() {
      var finalGrade = [], categoryScores = [];

      this.categories.map((item) => { // looping through array of related letters arrays
        var lettersGroup = []
        item.forEach(letter => { // related letters array
          var score = 0;
          this.userAnswers.filter(item => item.category == letter) // get answers for this category
            .forEach(item => score += item.proportion) // collect the score

          lettersGroup.push({ category: letter, score: score }) // set letter object
        })

        categoryScores.push(lettersGroup) // push related letters array
      })

      // Getting the letter with higher score from each letters group
      for (let i = 0; i < categoryScores.length; i++) {
        var score = null, selectedGroup = null;
        categoryScores[i].forEach(item => {
          console.log(item.score, item.category)
          if (item.score > score) {
            score = item.score
            selectedGroup = item
          }
        })

        finalGrade.push(selectedGroup)
      }

      this.finalResult = finalGrade
      var letters = this.finalResult.map((item => item.category))
      this.finalResultCouples = categoryScores
    }
  },

  computed: {
    ...mapState(useGeneralStore, ['language'])
  },
  watch: {
    language(current) {
      if (current == 'en') {
        this.questions = questionsEnArray;
      } else {
        this.questions = questionsArArray;
      }
    }
  }
}
</script>

<style scoped>
.btn.btn-primary,
.btn.btn-warning {
  border-radius: 25px;
  margin-top: 20px
}
</style>