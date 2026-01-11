import { BrandLogo } from '../icon/brand-logo'

export function AuthHeader() {
  return (
    <div className="fixed flex items-center justify-between w-full p-7">
      <div className="flex items-center gap-2">
        <BrandLogo />
      </div>
    </div>
  )
}
