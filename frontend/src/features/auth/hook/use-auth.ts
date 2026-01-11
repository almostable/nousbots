import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  authenticateUser,
  challengeUser,
  identifyUser,
  logoutUser,
} from '../api/request'

const useIdentifyUser = () => {
  return useMutation({
    mutationFn: identifyUser,
  })
}

const useLogoutUser = () => {
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => (window.location.href = '/'),
  })
}

const useChallengeUser = () => {
  return useMutation({
    mutationFn: challengeUser,
  })
}

const useAuthenticateUser = () => {
  return useMutation({
    mutationFn: authenticateUser,
  })
}

export { useIdentifyUser, useLogoutUser, useChallengeUser, useAuthenticateUser }
