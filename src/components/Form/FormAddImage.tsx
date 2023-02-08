import { Box, Button, Stack, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { api } from "../../services/api";
import { FileInput } from "../Input/FileInput";
import { TextInput } from "../Input/TextInput";

interface FormAddImageProps {
  closeModal: () => void;
}

interface ImageDataProps {
  url: string;
  title: string;
  description: string;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState("");
  const [localImageUrl, setLocalImageUrl] = useState("");
  const toast = useToast();

  const acceptedFormatsRegex =
    /(?:([^:/?#]+):)?(?:([^/?#]*))?([^?#](?:jpeg|gif|png))(?:\?([^#]*))?(?:#(.*))?/g;

  const formValidations = {
    image: {
      required: "Arquivo obrigatório",
      validate: {
        lessThan10MB: (fileList) =>
          fileList[0].size < 10000000 || "O arquivo deve ser menor que 10MB",
        acceptedFormats: (fileList) =>
          acceptedFormatsRegex.test(fileList[0].type) ||
          "Somente são aceitos arquivos PNG, JPEG e GIF",
      },
    },
    title: {
      required: "Título obrigatório",
      minLength: {
        value: 2,
        message: "Mínimo de 2 caracteres",
      },
      maxLength: {
        value: 20,
        message: "Máximo de 20 caracteres",
      },
    },
    description: {
      required: "Descrição obrigatória",
      maxLength: {
        value: 65,
        message: "Máximo de 65 caracteres",
      },
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(
    async (imageData: ImageDataProps) => {
      const response = await api.post("images", imageData);

      return response.data.user;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
      },
    }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();
  const { errors } = formState;

  const onSubmit = async (data: Record<string, unknown>): Promise<void> => {
    const { image, title, description } = data;
    const imageData = {
      url: imageUrl,
      title: String(title),
      description: String(description),
    };

    try {
      if (!imageUrl) {
        toast({
          title: "Imagem nao encontrada",
          description: "Imagem obrigatoria para criacaoOOOOOOO",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }
      await mutation.mutateAsync(imageData);
      toast({
        title: "Sucesso",
        description: "Imagem adicionada",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Falha no cadastro",
        description: "Erro ao tentar cadastrar a imagem, tente novamente.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      reset();
      setImageUrl("");
      setLocalImageUrl("");
      closeModal();
    }
  };

  console.log(errors);

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          name="image"
          onChange={() => {}}
          {...register("image", formValidations.image)}
        />

        <TextInput
          placeholder="Título da imagem..."
          name="title"
          type="text"
          error={errors.title}
          {...register("title", formValidations.title)}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          name="description"
          error={errors.description}
          {...register("description", formValidations.description)}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
