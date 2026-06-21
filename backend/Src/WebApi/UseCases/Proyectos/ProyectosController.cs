using Application.Common.Models;
using Application.UseCases.Proyectos;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.UseCases.Proyectos;

[ApiController]
[Route("api/proyectos")]
[Authorize]
public class ProyectosController : ControllerBase
{
    // TODO: Inject and use your Proyecto use cases here.
    //
    // Required endpoints:
    //   GET    /api/proyectos?pagina=1&tamanoPagina=10   — paginated list (all roles)
    //   GET    /api/proyectos/{id}                       — by id (all roles)
    //   POST   /api/proyectos                            — create [Authorize(Roles = "Administrador")]
    //   PUT    /api/proyectos/{id}                       — update [Authorize(Roles = "Administrador")]
    //   DELETE /api/proyectos/{id}                       — delete [Authorize(Roles = "Administrador")]

    private readonly IGetProyectosPagedUseCase _getPagedUseCase;
    private readonly IGetProyectoByIdUseCase _getByIdUseCase;
    private readonly ICreateProyectoUseCase _createUseCase;
    private readonly IUpdateProyectoUseCase _updateUseCase;
    private readonly IDeleteProyectoUseCase _deleteUseCase;

    public ProyectosController(
        IGetProyectosPagedUseCase getPagedUseCase,
        IGetProyectoByIdUseCase getByIdUseCase,
        ICreateProyectoUseCase createUseCase,
        IUpdateProyectoUseCase updateUseCase,
        IDeleteProyectoUseCase deleteUseCase)
    {
        _getPagedUseCase = getPagedUseCase;
        _getByIdUseCase = getByIdUseCase;
        _createUseCase = createUseCase;
        _updateUseCase = updateUseCase;
        _deleteUseCase = deleteUseCase;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged([FromQuery] int pagina = 1, [FromQuery] int tamanoPagina = 10)
    {
        var result = await _getPagedUseCase.Execute(new GetProyectosPagedRequest(pagina, tamanoPagina));
        return Ok(ApiResponse<PagedResult<ProyectoDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _getByIdUseCase.Execute(id);
        return Ok(ApiResponse<ProyectoDto>.Ok(result));
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Create([FromBody] CreateProyectoRequest request)
    {
        var creadoPorId = GetUsuarioIdFromToken();
        var id = await _createUseCase.Execute(request, creadoPorId);
        return Ok(ApiResponse<int>.Ok(id));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProyectoRequest request)
    {
        await _updateUseCase.Execute(id, request);
        return Ok(ApiResponse<object?>.Ok(null));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Delete(int id)
    {
        await _deleteUseCase.Execute(id);
        return Ok(ApiResponse<object?>.Ok(null));
    }

    private int GetUsuarioIdFromToken()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub");

        if (int.TryParse(userIdClaim?.Value, out var userId))
            return userId;

        throw new UnauthorizedAccessException("No se pudo identificar el usuario autenticado.");
    }
}
