<script setup>
//import { defineComponent } from 'vue';
import { ref, onMounted } from "vue";
import { useFuse } from '@vueuse/integrations/useFuse'
import { useApi } from '@directus/extensions-sdk';

const data = {
	administrator: {
		"article": "an",
		"thingsToDo": [
			"Create/Modify/Delete categories",
			"Create/Modify/Delete courses",
			"Modify/Delete resources",
			"Verify resources",
			"Manage users",
			"Modify about pages",
			"Create/Modify/Delete announcements"
		],
		"faq": {
			"How do I create resources?": "Don't upload resources as an Admin, because that will mess with the upload script",
			"Where should I upload files (not within resources)": "Upload the files outside the 'resource_files' folder"
		}
	},
	editor: {
		"article": "an",
		"thingsToDo": [
			"Create/Modify resources to be verified by moderators",
			"Enjoy life :-)"
		],
		"faq": {
			"I can't edit my own resources. Why?": "Is the resource you're trying to access verified by a moderator?<br/><br/>If the answer is yes, then you need to ask a moderator through the Editor's group to unverify the resource before editing it! Or you could submit a report through the frontend (coming soon).",
			"Why can't I see other unverified resources?": "Editors aren't allowed to see other resources because it's the moderator's job to verify that the resources are correct.<br/><br/>As an added bonus, if someone uploads something disgusting or traumatic, we will be the ones to suffer on your behalf ;)",
			"Why can't I change my own name?": "It is an necessary precaution. If you want to change it please contact a moderator through the Editor's group."
		}
	},
	moderator: {
		"article": "a",
		"thingsToDo": [
			"Create/Modify/Delete courses",
			"Create/Modify/Delete resources",
			"Verify resources according to our community guidelines",
			"Demote users if they violate our community guidelines",
			"Verify and change the names of new users if necessary"
		],
		"faq": {
			"How do I ban/change the name of users?": "Watch this video. <div class=\"content-container\"><iframe class=\"video\" src=\"https://www.youtube.com/embed/eaof76j9wNA?cc_load_policy=1\" title=\"Manage users\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe></div>The captions if you want more detailed steps."
		}
	},
	all: {
		"How do I create resources?": "This quick video should show you the basics.<br/><div class=\"content-container\"><iframe class=\"video\" src=\"https://www.youtube.com/embed/F3KdRtR8guA?cc_load_policy=1\" title=\"Creating a resource\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe></div>Make sure to turn on captions!",
		"My files aren't being uploaded. What did I do wrong?": "Make sure you don't press 'Done' when you upload files, even if the bar reaches 100%.<br/>Otherwise, nothing will be uploaded.\n <div class=\"content-container\"><img class= \"img-tut\" src=\"https://i.imgur.com/yBgS2GD.png\" /></div>",
		"How do I change my theme/language in the admin panel?": "This video should show you how. <div class=\"content-container\"><iframe class=\"video\" src=\"https://www.youtube.com/embed/vVhH5j8R9UA?cc_load_policy=1\" title=\"Change Theme/Language\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe></div>Make sure to turn on captions if you want the steps in!"
	}
}

const api = useApi()
const role = ref('')
const thingsToDo = ref([])
const faq = ref({})
const faqFiltered = ref({})
const article = ref('')
const activeAccordion = ref(-1)

onMounted(async () => {
	const userResponse = await api.get('/users/me')
	const roleId = userResponse.data.data.role
	const roleResponse = await api.get(`/roles/${roleId}`)
	role.value = roleResponse.data.data.name

	const allFaqs = data['all']
	const roleFile = data[role.value.toLowerCase()]

	thingsToDo.value = roleFile.thingsToDo
	article.value = roleFile.article
	faq.value = { ...allFaqs, ...roleFile.faq }
	onSearch()
});

const onSearch = (event) => {

	if (event?.target?.value && event.target.value !== '') {
		const { results } = useFuse(event?.target?.value, Object.keys(faq.value))
		const searchArray = results.value.map(result => result.item)
		const searchResult = {}

		Object.keys(faq.value).forEach((question) => {
			if (searchArray.includes(question)) {
				searchResult[question] = faq.value[question]
			}
		})

		faqFiltered.value = searchResult
	}
	else {
		faqFiltered.value = faq.value
	}
}

const toggleItem = (index) => {
	if (activeAccordion.value === index) {
		activeAccordion.value = -1
	}
	else {
		activeAccordion.value = index;
	}
}

</script>

<template>
	<private-view title="Overview">
		<template #navigation>
			<v-list nav>
				<v-list-item to="/welcome">
					<v-list-item-icon><v-icon name="overview_key" /></v-list-item-icon>
					<v-list-item-content>
						<v-text-overflow text="Overview" />
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</template>
		<div class="overview-content">
			<div class="box">
				<h2 class="h2-tut">
					You're {{ article }}
					<span class="highlight-container"><span class="highlight">
							{{ role }}!</span></span>
				</h2>
				<h3 class="h3-tut">Things to do:</h3>
				<ul class="ul-tut">
					<li v-for="thing in thingsToDo" :key="thing" clas="li-tut">
						{{ thing }}
					</li>
				</ul>
			</div>
			<h1 class="h1-tut">FAQs (Frequently Asked questions)</h1>
			<div class="input-container">
				<input id="search-faq" type="text" @input="onSearch" />
			</div>
			<div class="faq">
				<div
v-for="(item, index) in Object.keys(faqFiltered)" :key="item"
					:class="{ active: activeAccordion === index, 'faq-item': true }"
					@click="async (event) => { await toggleItem(index); event.target.scrollIntoView({ behavior: 'smooth', black: 'end' }) }">
					<summary class="faq-question">{{ item }}<span class="arrow">►</span></summary>
					<div v-if="activeAccordion === index" class="accordion-drawer">
						<span v-html="faqFiltered[item]" />
					</div>
				</div>
			</div>
		</div>
	</private-view>
</template>

<style>
.overview-content {
	padding: 0px 20px 20px 20px;
}

.box {
	border: 1px solid gray;
	border-radius: 20px;
	padding: 40px 40px 40px 40px;
	margin-bottom: 50px;
}

.h1-tut {
	margin-bottom: 40px;
	font-weight: 800;
}


.li-tut {
	padding: 5px 0px 5px 0px;
}

.input-container {
	display: flex;
	justify-content: center;
}

.h2-tut {
	margin-bottom: 20px;
}

#search-faq {
	width: 75%;
	height: 35px;
	border: solid 1px gray;
	border-radius: 20px;
	padding: 0px 30px 0px 30px;
}

.highlight-container,
.highlight {
	position: relative;
	color: white;
}

.highlight-container {
	display: inline-block;
}

.highlight-container:before {
	content: " ";
	display: block;
	height: 90%;
	width: 100%;
	margin-left: -3px;
	margin-right: -3px;
	position: absolute;
	background: gray;
	transform: rotate(2deg);
	top: -1px;
	left: -1px;
	border-radius: 20% 25% 20% 24%;
	padding: 10px 3px 3px 10px;
}

.faq {
	margin: 40px 0px 40px 0px;
	width: 100%;
}

.faq-item {
	padding-bottom: 10px;
}

.faq-question {
	border: 1px solid lightgray;
	padding: 15px 10px 15px 10px;
	user-select: none;
}

.faq-item>.faq-question {
	list-style: none;
}

.faq-question::-webkit-details-marker {
	display: none
}

.arrow {
	position: relative;
	float: right;
}

.active .arrow {
	transform: rotate(90deg)
}

.accordion-drawer {
	padding: 20px 20px 20px 20px;
	background-color: lightgray;
	color: black;
}

.content-container {
	margin: 20px 0px 20px 0px;
	display: flex;
	justify-content: center;
}

.video {
	width: 75%;
	aspect-ratio: 16 / 9;
}

.img-tut {
	width: 60%;
}

@media only screen and (max-width: 600px) {
	.video {
		width: 100%;
		aspect-ratio: 16 / 9;
	}

	.img-tut {
		width: 100%;
	}
}

@media only screen and (max-width: 320px) {}
</style>
