<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '@directus/extensions-sdk';
import { useI18n } from 'vue-i18n';
import en from './locales/en-US.json';
import ar from './locales/ar-SA.json';

interface faq {
	q: string;
	a: string;
	pic?: string;
	vid?: string;
}

const api = useApi();
const role = ref<keyof typeof roles>('contributor');
const activeAccordion = ref(-1);

const { t } = useI18n({
	messages: {
		en,
		ar,
	},
});

const roles = {
	administrator: {
		todo: [
			t('administrator.thingsToDo.ttd1'),
			t('administrator.thingsToDo.ttd2'),
			t('administrator.thingsToDo.ttd3'),
			t('administrator.thingsToDo.ttd4'),
			t('administrator.thingsToDo.ttd5'),
			t('administrator.thingsToDo.ttd6'),
			t('administrator.thingsToDo.ttd7'),
		],
		questions: [{ q: t('administrator.faq.q1.q'), a: t('administrator.faq.q1.a') }],
	},
	contributor: {
		todo: [t('contributor.thingsToDo.ttd1'), t('contributor.thingsToDo.ttd2')],
		questions: [
			{ q: t('contributor.faq.q1.q'), a: t('contributor.faq.q1.a') },
			{ q: t('contributor.faq.q2.q'), a: t('contributor.faq.q2.a') },
		],
	},
	moderator: {
		todo: [
			t('moderator.thingsToDo.ttd1'),
			t('moderator.thingsToDo.ttd2'),
			t('moderator.thingsToDo.ttd3'),
			t('moderator.thingsToDo.ttd4'),
			t('moderator.thingsToDo.ttd5'),
		],
		questions: [{ q: t('moderator.faq.q1.q'), a: t('moderator.faq.q1.a'), vid: '' }],
	},
};

const allFaqs = [
	{ q: t('allFaqs.q1.q'), a: t('allFaqs.q1.a'), vid: '' },
	{ q: t('allFaqs.q2.q'), a: t('allFaqs.q2.a'), pic: 'https://i.imgur.com/yBgS2GD.png' },
	{ q: t('allFaqs.q3.q'), a: t('allFaqs.q3.a'), vid: 'https://www.youtube.com/embed/wam1x1yjXms' },
	{ q: t('allFaqs.q4.q'), a: t('allFaqs.q4.a'), pic: 'https://i.imgur.com/4TXhmey.png' },
	{ q: t('allFaqs.q5.q'), a: t('allFaqs.q5.a'), pic: 'https://i.imgur.com/y8aBJgK.png' },
];

const toggleItem = (index: number) => {
	if (activeAccordion.value === index) {
		activeAccordion.value = -1;
	} else {
		activeAccordion.value = index;
	}
};

onMounted(async () => {
	const userResponse = await api.get('/users/me');
	const roleId = userResponse.data.data.role;
	const roleResponse = await api.get(`/roles/${roleId}`);
	role.value = roleResponse.data.data.name.toLowerCase();
});
</script>

<template>
	<private-view :title="t('title')">
		<template #navigation>
			<v-list nav>
				<v-list-item>
					<v-list-item-icon><v-icon name="overview_key" /></v-list-item-icon>
					<v-list-item-content>
						<v-text-overflow :text="t('title')" />
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</template>
		<div class="overview-content">
			<div class="box">
				<h2 class="h2-tut">
					{{ t('pronoun') }} {{ t(`${role}.article`) }}
					<span class="highlight-container">
						<span class="highlight">{{ t(`${role}.role`) }}!</span>
					</span>
				</h2>
				<h3 class="h3-tut">{{ t('ttd') }}</h3>
				<ul class="ul-tut">
					<li v-for="td in roles[role].todo" :key="td" clas="li-tut">
						{{ td }}
					</li>
				</ul>
			</div>
			<h1 class="h1-tut">{{ t('faq') }}</h1>
			<div class="faq">
				<div
					v-for="(item, index) in ([...allFaqs, ...roles[role].questions] as faq[])"
					:key="index"
					:class="{ active: activeAccordion === index, 'faq-item': true }"
					@click="
						async (event) => {
							await toggleItem(index);
							event.target.scrollIntoView({ behavior: 'smooth', black: 'end' });
						}
					"
				>
					<summary class="faq-question">
						{{ item.q }}
						<span class="arrow">►</span>
					</summary>
					<div v-if="activeAccordion === index" class="accordion-drawer">
						{{ item.a }}
						<div v-if="item.vid" class="content-container">
							<iframe
								class="video"
								:src="item.vid + '?cc_load_policy=1&autoplay=1&mute=1&modestbranding=1&rel=0'"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								allowfullscreen
							></iframe>
						</div>
						<div v-if="item.pic" class="content-container"><img class="img-tut" :src="item.pic" /></div>
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

.highlight-container:lang(ar-SA) {
	margin-right: 8px;
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
	content: ' ';
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

.faq-item > .faq-question {
	list-style: none;
}

.faq-question::-webkit-details-marker {
	display: none;
}

.arrow {
	position: relative;
	float: right;
	transform: rotate(-90deg);
}

.arrow:lang(ar-SA) {
	float: left;
}

.active .arrow {
	transform: rotate(90deg);
}

.accordion-drawer {
	padding: 20px 20px 20px 20px;
	background-color: rgba(211, 211, 211, 0.15);
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

@media only screen and (max-width: 320px) {
}
</style>
