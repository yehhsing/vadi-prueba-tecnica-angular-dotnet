using Application.Common.Models;
using Application.UseCases.Resumen;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.UseCases.Resumen;

[ApiController]
[Route("api/resumen")]
[Authorize]
public class ResumenController : ControllerBase
{
    private readonly IGetResumenUseCase _getResumenUseCase;

    public ResumenController(IGetResumenUseCase getResumenUseCase)
    {
        _getResumenUseCase = getResumenUseCase;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _getResumenUseCase.Execute();
        return Ok(ApiResponse<ResumenDto>.Ok(result));
    }
}
