import { Box, Flex, Text, Stack } from "@chakra-ui/react";
import { FormItemComponent } from "../FormItem/FormItemComponent.tsx";
import { isInTopField } from "../MetaBox/MetadataForm.tsx";
import { useCallback, useContext, useEffect, useState, } from "react";
import { MetaBoxContext } from "../MetaBox/metaBoxContext.ts";
import { ImagePrompt, PromptNodeInputItem, calcInputListRecursive } from "../MetaBox/utils.ts";
import { WorkspaceContext } from "../../../WorkspaceContext.ts";
import { workflowsTable } from "../../../db-tables/WorkspaceDB.ts";
// @ts-ignore
import { app } from "/scripts/app.js";
import { GalleryContext } from "../../GalleryContext.ts";
import { getMetadataFromUrl } from "../../utils.ts";

export default function AllPromptForm() {
  const { topFields, calcInputList, showNodeName } = useContext(MetaBoxContext);
  const {
    curFlowID,
  } = useContext(WorkspaceContext);
  const groupInputsByNodeType = useCallback(
    (inputList: PromptNodeInputItem[]) => {
      const groupedInputs: PromptNodeInputItem[][] = [];
      inputList.forEach((input) => {
        const lastGroup = groupedInputs[groupedInputs.length - 1];
        if (
          !lastGroup ||
          lastGroup[0].nodeID !== input.nodeID ||
          lastGroup[0].classType !== input.classType
        ) {
          groupedInputs.push([input]);
        } else {
          lastGroup.push(input);
        }
      });
      return groupedInputs;
    },
    [],
  );
  ////////////////////
  const { diffMode, diffImgSrc } = useContext(GalleryContext);
  const [currentCalcInputList, setCurrentCalcInputList] = useState<PromptNodeInputItem[]>([]);
  const [currentImagePrompt, setCurrentImagePrompt] = useState<ImagePrompt>();
  useEffect(() => {
    if (!currentImagePrompt) return;
    const calcInput = calcInputListRecursive(currentImagePrompt);
    setCurrentCalcInputList(calcInput);
  }, [currentImagePrompt]);
  async function loadCurrent() {
    return app.graphToPrompt(app.graph)
      .then((data: { output: any; workflow: any }) => {
        setCurrentImagePrompt(data.output);
      });
  }
  async function getMetadataFromDiffImgSrc(name: string) {
    const { prompt } = await getMetadataFromUrl('/workspace/view_media?filename=' + name)
    setCurrentImagePrompt(prompt);
  }
  useEffect(() => {
    if (diffImgSrc) {
      getMetadataFromDiffImgSrc(diffImgSrc)
    } else if (curFlowID) {
      loadCurrent()
    }
  }, [curFlowID, diffImgSrc]);
  ////////////////////
  useEffect(() => {
    calcInputList.forEach((input, idx) => {
      const currentInputItem = currentCalcInputList[idx]
      if (currentInputItem && input.nodeID === currentInputItem.nodeID && input.inputName === currentInputItem.inputName && currentInputItem.inputValue !== input.inputValue) {
        input.latestInputVal = currentInputItem.inputValue
      } else {
        input.latestInputVal = undefined
      }
    })
    console.log('calcInputList diff', calcInputList)
  }, [currentCalcInputList, calcInputList])

  if (!showNodeName) {
    return (
      <Stack>
        {calcInputList.map((input, idx) => {
          if (
            isInTopField(topFields, {
              name: input.inputName,
              promptKey: input.nodeID,
              classType: input.classType,
            })
          ) {
            return null;
          }

          return (
            <FormItemComponent
              key={`form${input.nodeID}${input.inputName}`}
              inputItem={input}
              diffMode={diffMode}
              selectedDiffName={diffImgSrc}

            />
          );
        })}
      </Stack>
    );
  }
  const nodes = groupInputsByNodeType(calcInputList);
  return (
    <Stack>
      {nodes.map((nodeInputs) => {
        if (!nodeInputs[0]) {
          return null;
        }
        return (
          <CustomAccordionPanel
            title={nodeInputs[0].classType + " #" + nodeInputs[0].nodeID}
            key={nodeInputs[0].nodeID}
          >
            <Flex px={2} gap={1} direction={"column"}>
              {nodeInputs.map((input) => {
                if (
                  isInTopField(topFields, {
                    name: input.inputName,
                    promptKey: input.nodeID,
                    classType: input.classType,
                  })
                ) {
                  return null;
                }

                return (
                  <FormItemComponent
                    key={`form${input.nodeID}${input.inputName}`}
                    inputItem={input}
                    diffMode={diffMode}
                    selectedDiffName={diffImgSrc}
                  />
                );
              })}
            </Flex>
          </CustomAccordionPanel>
        );
      })}
    </Stack>
  );
}

function CustomAccordionPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box border="1px" borderColor="gray.500" borderRadius="md" p={4}>
      <Text size="sm" mb={1} color={"GrayText"}>
        {title}
      </Text>
      <div>{children}</div>
    </Box>
  );
}
