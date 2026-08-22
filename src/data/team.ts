export interface TeamMember {
  id: string;
  name: string;
  detail: string;
  photo: string;
  telegram: string;
  github: string;
}

export const team: TeamMember[] = [
  {
    id: "mikhail",
    name: "Кудинов Михаил Дмитриевич",
    detail: "Может написать сайт с закрытыми глазами, но предпочитает с открытыми",
    photo: "/media/team/mikhail.jpg",
    telegram: "https://t.me/",
    github: "https://github.com/",
  },
  {
    id: "kirill",
    name: "Панин Кирилл Сергеевич",
    detail: "Автоматизирует бизнес-процессы так, что они начинают работать быстрее, чем он успевает выпить чай",
    photo: "/media/team/kirill.jpg",
    telegram: "https://t.me/",
    github: "https://github.com/",
  },
  {
    id: "asylzhan",
    name: "Ахунджанов Асылжан Бахтиярович",
    detail: "Единственный человек в студии, чьё имя помещается в мета-тег только со второго раза",
    photo: "/media/team/asylzhan.jpg",
    telegram: "https://t.me/",
    github: "https://github.com/",
  },
];
