import React, { useState } from "react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ThumbsUp,
  Search,
  User,
  MessageCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Question {
  id: number;
  text: string;
  user: string;
  date: string;
  useful: number;
  responses: Response[];
}

interface Response {
  id: number;
  text: string;
  user: string;
  date: string;
  useful: number;
}

const mockQuestions: Question[] = [
  {
    id: 1,
    text: "Bonjour il y a t'il quelés des accessoires avec??? Si oui lesquels ?",
    user: "Anna26",
    date: "18/04/2023",
    useful: 17,
    responses: [
      {
        id: 101,
        text: "non pas d'accessoire avec",
        user: "didier",
        date: "07/05/2023",
        useful: 5,
      },
    ],
  },
  {
    id: 2,
    text: "Je souhaiterai savoir si le fil d'alimentation reste libre ou si l'appareil a un enrouleur automatique pour pouvoir tout ranger ?",
    user: "Gomar",
    date: "10/05/2023",
    useful: 10,
    responses: [
      {
        id: 201,
        text: "oui, le fil à un enrouleur automatique",
        user: "Emma",
        date: "15/08/2023",
        useful: 1,
      },
    ],
  },
];

const ProductQA = () => {
  // const { t } = useLanguage();
  const { t } = useTranslation();
  const [filter, setFilter] = useState("most-useful");

  return (
    <div className="bg-white rounded-lg border border-cebleu-purple-200 overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="qa-section" className="border-b-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline bg-cebleu-purple-50/50">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-cebleu-purple-800">
                {t("products.questionsAnswers")}{" "}
                <span className="text-sm font-normal">
                  (14 {t("products.questions")})
                </span>
              </h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="py-0">
            <div className="p-6 pt-4 border-t border-cebleu-purple-200/50">
              <div className="flex gap-6">
                <div className="w-1/4">
                  <div className="bg-cebleu-purple-50/50 p-4 rounded-lg">
                    <div className="flex items-center text-cebleu-purple-700 mb-3">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      <p className="text-sm font-medium">
                        14 {t("products.questions")} {t("products.postedBy")}{" "}
                        {t("products.community")} {t("products.with")} 13{" "}
                        {t("products.havingResponse")}
                      </p>
                    </div>

                    <h4 className="font-medium text-sm mb-2">
                      {t("products.sortQuestions")}:
                    </h4>
                    <RadioGroup defaultValue="most-useful" className="mb-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="most-useful" id="most-useful" />
                        <Label htmlFor="most-useful">
                          {t("products.mostUseful")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="most-recent" id="most-recent" />
                        <Label htmlFor="most-recent">
                          {t("products.mostRecent")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="with-answers"
                          id="with-answers"
                        />
                        <Label htmlFor="with-answers">
                          {t("products.withAnswers")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="without-answers"
                          id="without-answers"
                        />
                        <Label htmlFor="without-answers">
                          {t("products.withoutAnswers")}
                        </Label>
                      </div>
                    </RadioGroup>

                    <Button className="w-full bg-cebleu-purple-600">
                      {t("products.askQuestion")}
                    </Button>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      className="pl-10 pr-10 bg-white border-cebleu-purple-200"
                      placeholder={t("products.searchQuestion")}
                    />
                    {/* X button would be here */}
                  </div>

                  <div className="space-y-8">
                    {mockQuestions.map((question) => (
                      <div key={question.id} className="space-y-4">
                        <div className="bg-cebleu-purple-50/50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center text-cebleu-purple-500 text-sm">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {t("products.mostUsefulQuestion")}
                            </div>
                            <div className="text-lg font-semibold text-cebleu-purple-800">
                              {question.responses.length}
                              <span className="text-sm font-normal ml-1">
                                {t("products.answers")}
                              </span>
                            </div>
                          </div>
                          <p className="text-cebleu-purple-800">
                            {question.text}
                          </p>
                        </div>

                        <div className="pl-4 border-l-2 border-cebleu-purple-100">
                          <div className="flex items-center mb-2">
                            <User className="h-5 w-5 text-cebleu-purple-600 mr-2" />
                            <span className="text-sm text-cebleu-purple-700">
                              {t("products.questionPostedBy")}{" "}
                              <strong>{question.user}</strong>{" "}
                              {t("products.on")} {question.date}
                            </span>
                            <div className="ml-auto space-x-4">
                              <button className="text-sm text-cebleu-purple-600 hover:underline">
                                {t("products.report")}
                              </button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />{" "}
                                {question.useful}
                              </Button>
                            </div>
                          </div>

                          {question.responses.map((response) => (
                            <div
                              key={response.id}
                              className="bg-cebleu-purple-50/30 p-4 rounded-lg mb-4"
                            >
                              <div className="flex items-center text-cebleu-purple-500 text-sm mb-2">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {t("products.mostUsefulAnswer")}
                              </div>
                              <p className="text-cebleu-purple-800 mb-2">
                                {response.text}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-cebleu-purple-700">
                                  {t("products.answerPostedBy")}{" "}
                                  <strong>{response.user}</strong>{" "}
                                  {t("products.on")} {response.date}
                                </span>
                                <div className="space-x-4">
                                  <button className="text-sm text-cebleu-purple-600 hover:underline">
                                    {t("products.report")}
                                  </button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7"
                                  >
                                    <ThumbsUp className="h-3 w-3 mr-1" />{" "}
                                    {response.useful}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="flex justify-between text-sm text-cebleu-purple-600">
                            <button className="flex items-center hover:underline">
                              <ChevronDown className="h-4 w-4 mr-1" />
                              {t("products.viewAllAnswers")}
                            </button>
                            <button className="flex items-center hover:underline">
                              <ChevronDown className="h-4 w-4 mr-1" />
                              {t("products.viewLessInfo")}
                            </button>
                          </div>

                          <div className="text-right mt-2">
                            <Button
                              variant="outline"
                              className="text-cebleu-purple-700 border-cebleu-purple-300"
                            >
                              {t("products.answerQuestion")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ProductQA;
