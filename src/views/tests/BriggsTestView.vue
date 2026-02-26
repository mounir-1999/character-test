<template>
  <div class="container mb-5">

    <!-- Name modal (shown before starting the test) -->
    <div v-if="showNameModal" class="modal-backdrop-custom">
      <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ language == 'en' ? 'Enter your name' : 'ادخل اسمك' }}</h5>
            </div>
            <div class="modal-body">
              <label class="form-label fw-bold">{{ language == 'en' ? 'Name' : 'الاسم' }}</label>
              <input class="form-control" type="text" v-model.trim="userName"
                :placeholder="language == 'en' ? 'Your name...' : 'اسمك...'" @keyup.enter="startTest" />
              <small class="text-muted d-block mt-2">
                {{
                  language == 'en'
                    ? 'We will save your final 4-letter result to Firebase.'
                    : 'سنقوم بحفظ نتيجة الأحرف الأربعة في Firebase.'
                }}
              </small>

              <div v-if="firebaseError" class="alert alert-danger mt-3 mb-0">
                {{ firebaseError }}
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary fw-bold" :disabled="!userName" @click="startTest">
                {{ language == 'en' ? 'Start' : 'ابدأ' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row" v-if="!finalResult && !showNameModal">
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
    <div v-if="finalResult">
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
import { getAuth, signInAnonymously } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'

export default {
  data() {
    return {
      index: 0,
      currentAnswer: null,
      userName: '',
      showNameModal: true,
      firebaseError: null,
      categories: [
        ["E", "I"],
        ["S", "N"],
        ["T", "F"],
        ["J", "P"],
      ],
      questions: [], // imported using script tag from another file
      finalResult: null,
      userAnswers: [],
      finalResultCouples: null
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
    startTest() {
      this.firebaseError = null
      if (!this.userName) return
      this.showNameModal = false
    },

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

      // Save the final 4-letter result to Firebase (Firestore)
      // Example: name="Monir", result="ENTP"
      this.saveResultToFirebase(letters.join(''))
    },
    async saveResultToFirebase(result4Letters) {
      try {
        const auth = getAuth();

        // Sign in anonymously if not already signed in
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
        await addDoc(collection(db, 'testResults'), {
          test: 'briggs',
          name: this.userName,
         uid: auth.currentUser.uid,   // 🔥 important
            result: result4Letters,
          createdAt: serverTimestamp(),
        })
      } catch (err) {
        // If Firebase env is missing or Firestore rules deny the write, show a friendly message.
        this.firebaseError =
          (this.language == 'en'
            ? 'Could not save to Firebase. Check your .env Firebase config and Firestore rules.'
            : 'تعذر الحفظ في Firebase. تأكد من إعدادات .env وقواعد Firestore.') +
          (err?.message ? `\n${err.message}` : '')
        console.error(err)
      }
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

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1050;
}
</style>